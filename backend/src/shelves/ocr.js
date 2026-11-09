import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createWorker } from 'tesseract.js'
import { getShelfImage } from './images.js'

const cacheDirectory = fileURLToPath(new URL('../../.local/ocr-cache/', import.meta.url))
let workerPromise
let recognitionQueue = Promise.resolve()

async function getWorker() {
  if (!workerPromise) {
    workerPromise = mkdir(cacheDirectory, { recursive: true })
      .then(() => createWorker('eng', 1, { cachePath: cacheDirectory }))
      .catch((error) => {
        workerPromise = undefined
        throw error
      })
  }
  return workerPromise
}

export function recognizeShelfImage(imageId) {
  const run = async () => {
    const image = await getShelfImage(imageId)
    const worker = await getWorker()
    try {
      const result = await worker.recognize(image.data)
      return { imageId, text: result.data.text.trim() }
    } catch (error) {
      workerPromise = undefined
      await worker.terminate().catch(() => {})
      throw error
    }
  }

  // A single worker handles one photograph at a time.
  const job = recognitionQueue.then(run, run)
  recognitionQueue = job.then(() => undefined, () => undefined)
  return job
}

export async function closeOcrWorker() {
  await recognitionQueue
  if (workerPromise) {
    const worker = await workerPromise.catch(() => null)
    workerPromise = undefined
    await worker?.terminate()
  }
}
