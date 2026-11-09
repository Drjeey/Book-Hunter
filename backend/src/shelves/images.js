import { randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024
const defaultDirectory = fileURLToPath(new URL('../../.local/shelf-images/', import.meta.url))
const imageDirectory = process.env.SHELF_IMAGE_DIR || defaultDirectory
const imageIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const formats = {
  'image/jpeg': { extension: 'jpg', matches: (data) => data.length >= 4 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff },
  'image/png': { extension: 'png', matches: (data) => data.length >= 8 && data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) },
  'image/webp': { extension: 'webp', matches: (data) => data.length >= 12 && data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WEBP' },
}

export class ShelfImageError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.name = 'ShelfImageError'
    this.status = status
  }
}

export async function readImageBody(request) {
  const contentType = (request.headers['content-type'] || '').split(';')[0].trim().toLowerCase()
  if (!formats[contentType]) {
    throw new ShelfImageError('Choose a JPEG, PNG, or WebP image.', 415)
  }

  const chunks = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    if (size > MAX_IMAGE_BYTES) {
      throw new ShelfImageError('Choose an image smaller than 8 MB.', 413)
    }
    chunks.push(chunk)
  }

  const data = Buffer.concat(chunks, size)
  if (!formats[contentType].matches(data)) {
    throw new ShelfImageError('The file does not match its image type.')
  }
  return { contentType, data }
}

export async function saveShelfImage({ contentType, data }) {
  const format = formats[contentType]
  if (!format || !Buffer.isBuffer(data) || data.length > MAX_IMAGE_BYTES || !format.matches(data)) {
    throw new ShelfImageError('Choose a valid JPEG, PNG, or WebP image smaller than 8 MB.')
  }

  const id = randomUUID()
  await mkdir(imageDirectory, { recursive: true })
  await writeFile(path.join(imageDirectory, `${id}.${format.extension}`), data, { flag: 'wx', mode: 0o600 })
  return { id, contentType, size: data.length, url: `/api/v1/shelf-images/${id}` }
}

export async function getShelfImage(id) {
  if (!imageIdPattern.test(id)) throw new ShelfImageError('Image not found.', 404)
  for (const [contentType, format] of Object.entries(formats)) {
    try {
      const data = await readFile(path.join(imageDirectory, `${id}.${format.extension}`))
      return { contentType, data }
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error
    }
  }
  throw new ShelfImageError('Image not found.', 404)
}
