import { useCallback, useEffect, useState, type FormEvent } from 'react'

type BookResult = {
  id: string
  title: string
  authors: string[]
  firstPublishedYear: number | null
  coverUrl: string | null
  isbn: string | null
  editionCount: number | null
  sourceUrl: string
}

type BookSearchResponse = {
  query: string
  page: number
  pageSize: number
  total: number
  books: BookResult[]
}

type SearchState = 'idle' | 'loading' | 'loading-more' | 'success' | 'error'

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <circle cx="10.8" cy="10.8" r="6.3" />
      <path d="m15.5 15.5 4.2 4.2" />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M4.5 5.5c3.1-1 5.6-.3 7.5 1.5v12c-1.9-1.8-4.4-2.5-7.5-1.5v-12Z" />
      <path d="M19.5 5.5c-3.1-1-5.6-.3-7.5 1.5v12c1.9-1.8 4.4-2.5 7.5-1.5v-12Z" />
    </svg>
  )
}

function BookCover({ title, coverUrl }: { title: string; coverUrl: string | null }) {
  const [failed, setFailed] = useState(false)

  if (coverUrl && !failed) {
    return (
      <img
        className="book-cover-image"
        src={coverUrl}
        alt={`Cover of ${title}`}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <div className="book-cover-placeholder" role="img" aria-label={`No cover available for ${title}`}>
      <BookIcon />
      <span>Cover unavailable</span>
    </div>
  )
}

function SearchEmptyState({ query }: { query?: string }) {
  const searching = Boolean(query)

  return (
    <section aria-labelledby="empty-heading" className="empty-state search-empty-state">
      <div className="empty-icon-wrap">
        <BookIcon />
      </div>
      <h2 id="empty-heading">{searching ? 'No matches found' : 'Your reading shelf is waiting'}</h2>
      <p>
        {searching
          ? `We couldn’t find books matching “${query}”. Try a different title or author.`
          : 'Search the book catalog by title or author to find your next read.'}
      </p>
      {!searching && (
        <div className="privacy-note">
          <span>One private library. No public profile.</span>
        </div>
      )}
    </section>
  )
}

function LoadingCards() {
  return (
    <div className="book-results-grid" aria-hidden="true">
      {[0, 1, 2].map((item) => (
        <div className="book-result-card book-result-skeleton" key={item}>
          <div className="skeleton-cover" />
          <div className="skeleton-copy">
            <span />
            <span />
            <span />
          </div>
        </div>
      ))}
    </div>
  )
}

function BookCard({ book, isSaved, isSaving, saveMessage, onSave }: {
  book: BookResult
  isSaved: boolean
  isSaving: boolean
  saveMessage: string
  onSave: () => void
}) {
  const metadata = [
    book.firstPublishedYear ? `First published ${book.firstPublishedYear}` : null,
    book.editionCount ? `${book.editionCount} editions` : null,
  ].filter(Boolean)

  return (
    <article className="book-result-card">
      <div className="book-cover-frame">
        <BookCover title={book.title} coverUrl={book.coverUrl} />
      </div>
      <div className="book-result-copy">
        <h3>{book.title}</h3>
        <p className="book-result-author">
          {book.authors.length > 0 ? book.authors.join(', ') : 'Author not listed'}
        </p>
        {metadata.length > 0 && <p className="book-result-metadata">{metadata.join(' · ')}</p>}
        {book.isbn && <p className="book-result-isbn">ISBN {book.isbn}</p>}
        <a className="book-source-link" href={book.sourceUrl} target="_blank" rel="noreferrer">
          View on Open Library <span aria-hidden="true">↗</span>
        </a>
        <button className="library-save-button" type="button" disabled={isSaved || isSaving} onClick={onSave}>
          {isSaved ? 'In your library' : isSaving ? 'Saving…' : 'Add to My Library'}
        </button>
        {saveMessage && <span className="library-save-message" role="status">{saveMessage}</span>}
      </div>
    </article>
  )
}

export default function BookSearch() {
  const [input, setInput] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [page, setPage] = useState(1)
  const [retryCount, setRetryCount] = useState(0)
  const [books, setBooks] = useState<BookResult[]>([])
  const [total, setTotal] = useState(0)
  const [searchState, setSearchState] = useState<SearchState>('idle')
  const [searchError, setSearchError] = useState('')
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set())
  const [savingIds, setSavingIds] = useState<Set<string>>(() => new Set())
  const [saveMessages, setSaveMessages] = useState<Record<string, string>>({})

  const refreshSavedBooks = useCallback(() => {
    fetch('/api/v1/library')
      .then(async (response) => {
        if (!response.ok) return null
        return await response.json() as { books: { sourceBookId: string }[] }
      })
      .then((payload) => {
        if (payload) setSavedIds(new Set(payload.books.map((book) => book.sourceBookId)))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    refreshSavedBooks()
    window.addEventListener('bookhunt:library-updated', refreshSavedBooks)
    return () => window.removeEventListener('bookhunt:library-updated', refreshSavedBooks)
  }, [refreshSavedBooks])

  async function saveBook(book: BookResult) {
    setSavingIds((current) => new Set(current).add(book.id))
    setSaveMessages((current) => ({ ...current, [book.id]: '' }))
    try {
      const response = await fetch('/api/v1/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book),
      })
      const payload = await response.json() as { error?: string }
      if (!response.ok) {
        if (response.status === 409) {
          setSavedIds((current) => new Set(current).add(book.id))
          setSaveMessages((current) => ({ ...current, [book.id]: 'Already saved in your library.' }))
          return
        }
        throw new Error(payload.error || 'This book could not be saved. Please try again.')
      }
      setSavedIds((current) => new Set(current).add(book.id))
      setSaveMessages((current) => ({ ...current, [book.id]: 'Added to your library.' }))
      window.dispatchEvent(new Event('bookhunt:library-updated'))
    } catch (error) {
      setSaveMessages((current) => ({
        ...current,
        [book.id]: error instanceof Error ? error.message : 'This book could not be saved. Please try again.',
      }))
    } finally {
      setSavingIds((current) => {
        const next = new Set(current)
        next.delete(book.id)
        return next
      })
    }
  }

  useEffect(() => {
    if (!submittedQuery) return

    const controller = new AbortController()
    const params = new URLSearchParams({ query: submittedQuery, page: String(page) })

    setSearchState(page === 1 ? 'loading' : 'loading-more')
    setSearchError('')

    fetch(`/api/v1/books?${params}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json() as BookSearchResponse | { error?: string }
        if (!response.ok) {
          throw new Error('error' in payload && payload.error
            ? payload.error
            : 'Book search could not be completed. Please try again.')
        }
        return payload as BookSearchResponse
      })
      .then((payload) => {
        setBooks((current) => page === 1 ? payload.books : [...current, ...payload.books])
        setTotal(payload.total)
        setSearchState('success')
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setSearchError(error instanceof Error
          ? error.message
          : 'Book search could not be completed. Please try again.')
        setSearchState('error')
      })

    return () => controller.abort()
  }, [submittedQuery, page, retryCount])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = input.trim()
    if (query.length < 2 || query.length > 120) return

    setSubmittedQuery(query)
    setPage(1)
    setBooks([])
    setTotal(0)
    setSearchError('')
    setSearchState('loading')
    setRetryCount((current) => current + 1)
  }

  function retrySearch() {
    setRetryCount((current) => current + 1)
  }

  const isLoading = searchState === 'loading' || searchState === 'loading-more'
  const canLoadMore = books.length < total && page < 100
    && (searchState === 'success' || searchState === 'loading-more')

  return (
    <>
      <section aria-labelledby="search-heading" className="search-section">
        <h2 id="search-heading">Search by title or author</h2>
        <p className="search-description">Search the Open Library catalog to find books for your reading list.</p>
        <form className="search-form" role="search" onSubmit={handleSubmit}>
          <label className="search-field">
            <SearchIcon />
            <span className="visually-hidden">Search for a book by title or author</span>
            <input
              type="search"
              value={input}
              placeholder="e.g., Virginia Woolf, Middlemarch, or Invisible Man"
              onChange={(event) => setInput(event.target.value)}
              minLength={2}
              maxLength={120}
              required
            />
          </label>
          <button className="search-button" type="submit" disabled={input.trim().length < 2 || isLoading}>
            {searchState === 'loading' ? 'Searching…' : 'Search'}
            {searchState !== 'loading' && <span aria-hidden="true">→</span>}
          </button>
        </form>
      </section>

      {!submittedQuery && <SearchEmptyState />}

      {submittedQuery && (
        <section
          aria-labelledby="results-heading"
          className="book-results-section"
          aria-busy={isLoading}
        >
          <div className="results-heading-row">
            <div>
              <h2 id="results-heading">Search results</h2>
              <p className="results-query">For “{submittedQuery}”</p>
            </div>
            {searchState === 'success' && (
              <p className="results-count" aria-live="polite">
                {total.toLocaleString()} {total === 1 ? 'result' : 'results'}
              </p>
            )}
          </div>

          {searchState === 'loading' && (
            <>
              <p className="visually-hidden" role="status">Searching the book catalog…</p>
              <LoadingCards />
            </>
          )}

          {searchState === 'error' && books.length === 0 && (
            <div className="search-error" role="alert">
              <div>
                <h3>We couldn’t connect to the book catalog</h3>
                <p>{searchError}</p>
              </div>
              <button className="button button-secondary" type="button" onClick={retrySearch}>
                Retry search
              </button>
            </div>
          )}

          {searchState === 'success' && books.length === 0 && <SearchEmptyState query={submittedQuery} />}

          {books.length > 0 && (
            <>
              <div className="book-results-grid">
                {books.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    isSaved={savedIds.has(book.id)}
                    isSaving={savingIds.has(book.id)}
                    saveMessage={saveMessages[book.id] ?? ''}
                    onSave={() => void saveBook(book)}
                  />
                ))}
              </div>
              {searchError && (
                <div className="search-inline-error" role="alert">
                  <p>{searchError}</p>
                  <button className="button button-secondary" type="button" onClick={retrySearch}>
                    Retry
                  </button>
                </div>
              )}
              {canLoadMore && (
                <div className="load-more-row">
                  <button
                    className="button button-secondary load-more-button"
                    type="button"
                    onClick={() => setPage((current) => current + 1)}
                    disabled={isLoading}
                  >
                    {searchState === 'loading-more' ? 'Loading more…' : 'Show more results'}
                  </button>
                </div>
              )}
            </>
          )}

          <p className="catalog-attribution">
            Book information provided by <a href="https://openlibrary.org" target="_blank" rel="noreferrer">Open Library</a>.
          </p>
        </section>
      )}
    </>
  )
}
