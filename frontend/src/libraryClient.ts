import { publicSite } from './deployment'

export type ReadingStatus = 'want_to_read' | 'reading' | 'read' | 'did_not_finish'
export type CatalogBook = {
  id: string
  title: string
  authors: string[]
  firstPublishedYear: number | null
  coverUrl: string | null
  isbn: string | null
}
export type LibraryBook = CatalogBook & {
  sourceBookId: string
  status: ReadingStatus
  rating: number | null
  note: string
  addedAt: string
}

export class LibraryClientError extends Error {
  status: number
  constructor(message: string, status = 0) {
    super(message)
    this.status = status
  }
}

const databaseName = 'book-hunter-browser-library'
const storeName = 'books'

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(storeName)) {
        const store = request.result.createObjectStore(storeName, { keyPath: 'id' })
        store.createIndex('sourceBookId', 'sourceBookId', { unique: true })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Browser library could not be opened.'))
  })
}

async function transact<T>(mode: IDBTransactionMode, perform: (
  store: IDBObjectStore,
  setResult: (value: T) => void,
  fail: (error: Error) => void,
) => void): Promise<T> {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, mode)
    let result!: T
    let failure: Error | null = null
    transaction.oncomplete = () => { database.close(); resolve(result) }
    const rejectTransaction = () => {
      database.close()
      reject(failure ?? transaction.error ?? new Error('Browser library could not be updated.'))
    }
    transaction.onerror = rejectTransaction
    transaction.onabort = rejectTransaction
    try {
      perform(transaction.objectStore(storeName), (value) => { result = value }, (error) => {
        failure = error
        transaction.abort()
      })
    } catch (error) {
      failure = error instanceof Error ? error : new Error('Browser library could not be updated.')
      transaction.abort()
    }
  })
}

async function requestJson<T>(url: string, options: RequestInit | undefined, fallback: string): Promise<T> {
  const response = await fetch(url, options)
  const payload = await response.json().catch(() => null) as (T & { error?: string }) | null
  if (!response.ok || !payload) {
    throw new LibraryClientError(payload?.error ?? fallback, response.status)
  }
  return payload
}

export async function listLibraryBooks(): Promise<LibraryBook[]> {
  if (!publicSite) {
    const payload = await requestJson<{ books: LibraryBook[] }>('/api/v1/library', undefined, 'Your library could not be loaded. Please try again.')
    return payload.books
  }
  const books = await transact<LibraryBook[]>('readonly', (store, setResult) => {
    const request = store.getAll()
    request.onsuccess = () => setResult(request.result as LibraryBook[])
  })
  return books.sort((a, b) => b.addedAt.localeCompare(a.addedAt))
}

export async function addLibraryBook(book: CatalogBook): Promise<void> {
  if (!publicSite) {
    await requestJson('/api/v1/library', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book),
    }, 'This book could not be saved. Please try again.')
    return
  }
  if (!/^[A-Za-z0-9_-]{1,120}$/.test(book.id) || !book.title.trim() || book.title.length > 500) {
    throw new LibraryClientError('This catalog result could not be saved.', 400)
  }
  try {
    await transact<void>('readwrite', (store) => {
      store.add({
        id: crypto.randomUUID(), sourceBookId: book.id, title: book.title.trim(),
        authors: book.authors, firstPublishedYear: book.firstPublishedYear,
        coverUrl: book.coverUrl, isbn: book.isbn, status: 'want_to_read',
        rating: null, note: '', addedAt: new Date().toISOString(),
      } satisfies LibraryBook)
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'ConstraintError') {
      throw new LibraryClientError('This book is already in your library.', 409)
    }
    throw error
  }
}

async function updateBrowserBook(id: string, change: (book: LibraryBook) => LibraryBook): Promise<LibraryBook> {
  return transact<LibraryBook>('readwrite', (store, setResult, fail) => {
    const request = store.get(id)
    request.onsuccess = () => {
      if (!request.result) { fail(new LibraryClientError('That book was not found in your library.', 404)); return }
      const updated = change(request.result as LibraryBook)
      store.put(updated)
      setResult(updated)
    }
  })
}

export async function updateBookStatus(id: string, status: ReadingStatus): Promise<void> {
  if (!publicSite) {
    await requestJson(`/api/v1/library/${encodeURIComponent(id)}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    }, 'The reading status could not be changed.')
    return
  }
  await updateBrowserBook(id, (book) => ({ ...book, status }))
}

export async function updateBookReflection(id: string, rating: number | null, note: string): Promise<{ rating: number | null; note: string }> {
  if (!publicSite) {
    return requestJson(`/api/v1/library/${encodeURIComponent(id)}/reflection`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rating, note }),
    }, 'Your rating and note could not be saved.')
  }
  if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) throw new LibraryClientError('Choose a rating from 1 to 5.')
  if (note.length > 2000) throw new LibraryClientError('Keep your note under 2000 characters.')
  const updated = await updateBrowserBook(id, (book) => ({ ...book, rating, note: note.trim() }))
  return { rating: updated.rating, note: updated.note }
}

export async function removeLibraryBook(id: string): Promise<void> {
  if (!publicSite) {
    await requestJson(`/api/v1/library/${encodeURIComponent(id)}`, { method: 'DELETE' }, 'The book could not be removed. Please try again.')
    return
  }
  await transact<void>('readwrite', (store, _setResult, fail) => {
    const request = store.get(id)
    request.onsuccess = () => {
      if (!request.result) { fail(new LibraryClientError('That book was not found in your library.', 404)); return }
      store.delete(id)
    }
  })
}
