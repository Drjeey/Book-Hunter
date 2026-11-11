import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import handler from '../netlify/functions/books.mjs'

const originalFetch = globalThis.fetch
after(() => { globalThis.fetch = originalFetch })

test('Netlify book search rejects invalid queries as JSON', async () => {
  const response = await handler(new Request('https://example.test/api/v1/books?query=x'))
  assert.equal(response.status, 400)
  assert.match(response.headers.get('content-type'), /application\/json/)
  assert.match((await response.json()).error, /at least 2 characters/)
})

test('Netlify book search returns normalized catalog results', async () => {
  globalThis.fetch = async (url) => {
    assert.match(String(url), /openlibrary\.org\/search\.json/)
    return new Response(JSON.stringify({
      numFound: 1,
      docs: [{ key: '/works/OL123W', title: 'Test Book', author_name: ['Test Author'] }],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }

  const response = await handler(new Request('https://example.test/api/v1/books?query=unique+book+test'))
  assert.equal(response.status, 200)
  const result = await response.json()
  assert.equal(result.books[0].id, 'OL123W')
  assert.equal(result.books[0].title, 'Test Book')
  assert.equal(result.total, 1)
})
