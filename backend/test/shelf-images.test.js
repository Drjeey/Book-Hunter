import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { Readable } from 'node:stream'
import { after, test } from 'node:test'

const directory = await mkdtemp(path.join(tmpdir(), 'book-hunt-images-'))
process.env.SHELF_IMAGE_DIR = directory
const { getShelfImage, MAX_IMAGE_BYTES, readImageBody, saveShelfImage, ShelfImageError } = await import('../src/shelves/images.js')
after(() => rm(directory, { recursive: true, force: true }))

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==', 'base64')

test('stores a valid image and retrieves the same bytes', async () => {
  const request = Object.assign(Readable.from([png]), { headers: { 'content-type': 'image/png' } })
  const image = await saveShelfImage(await readImageBody(request))
  assert.match(image.id, /^[0-9a-f-]{36}$/)
  assert.equal(image.size, png.length)
  const loaded = await getShelfImage(image.id)
  assert.equal(loaded.contentType, 'image/png')
  assert.deepEqual(loaded.data, png)
})

test('rejects a file whose bytes do not match its declared type', async () => {
  const request = Object.assign(Readable.from([Buffer.from('not an image')]), { headers: { 'content-type': 'image/png' } })
  await assert.rejects(readImageBody(request), (error) => error instanceof ShelfImageError && error.status === 400)
})

test('rejects oversized uploads before saving them', async () => {
  const request = Object.assign(Readable.from([Buffer.alloc(MAX_IMAGE_BYTES + 1)]), { headers: { 'content-type': 'image/png' } })
  await assert.rejects(readImageBody(request), (error) => error instanceof ShelfImageError && error.status === 413)
})

test('does not accept a path or unknown image id', async () => {
  await assert.rejects(getShelfImage('../../secret'), (error) => error instanceof ShelfImageError && error.status === 404)
})
