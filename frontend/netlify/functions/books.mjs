import { searchBooks, SearchProviderError } from '../../../backend/src/books/search.js'

export const config = { path: '/api/v1/books' }

function jsonResponse(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

export default async function handler(request) {
  if (request.method !== 'GET') {
    return jsonResponse(405, { error: 'Use GET to search books.' })
  }

  const url = new URL(request.url)
  try {
    const result = await searchBooks({
      query: url.searchParams.get('query'),
      page: url.searchParams.get('page'),
    })
    return jsonResponse(200, result)
  } catch (error) {
    if (error instanceof SearchProviderError) {
      return jsonResponse(error.status, { error: error.message })
    }
    console.error('Netlify book search failed:', error)
    return jsonResponse(500, { error: 'Book search could not be completed.' })
  }
}
