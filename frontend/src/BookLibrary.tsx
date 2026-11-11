import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { publicSearchOnly } from './deployment'

type ReadingStatus = 'want_to_read' | 'reading' | 'read' | 'did_not_finish'
type LibraryBook = {
  id: string
  sourceBookId: string
  title: string
  authors: string[]
  firstPublishedYear: number | null
  coverUrl: string | null
  isbn: string | null
  status: ReadingStatus
  rating: number | null
  note: string
}

const statusLabels: Record<ReadingStatus, string> = {
  want_to_read: 'Want to read',
  reading: 'Reading',
  read: 'Read',
  did_not_finish: 'Did not finish',
}

const filters: { value: 'all' | ReadingStatus; label: string }[] = [
  { value: 'all', label: 'All books' },
  { value: 'want_to_read', label: 'Want to read' },
  { value: 'reading', label: 'Reading' },
  { value: 'read', label: 'Read' },
  { value: 'did_not_finish', label: 'Did not finish' },
]

function Cover({ book }: { book: LibraryBook }) {
  const [failed, setFailed] = useState(false)
  if (book.coverUrl && !failed) {
    return <img className="library-cover-image" src={book.coverUrl} alt={`Cover of ${book.title}`} loading="lazy" onError={() => setFailed(true)} />
  }
  return <div className="library-cover-fallback" role="img" aria-label={`No cover available for ${book.title}`}><span aria-hidden="true">B</span></div>
}

export default function BookLibrary() {
  if (publicSearchOnly) {
    return <main id="library" className="main-content library-page">
      <div className="page-intro library-intro"><p className="eyebrow">Private archive · Reading shelf</p><h1>My Library</h1></div>
      <section className="library-message library-empty" aria-labelledby="library-online-heading">
        <h2 id="library-online-heading">Your private library is not hosted yet</h2>
        <p>Book Hunter can search the catalog online. Saving books, ratings, and notes requires the private backend and database. Your local library is available when you run the app on your computer.</p>
        <a className="button button-primary" href="#discover">Search books</a>
      </section>
    </main>
  }
  return <PrivateBookLibrary />
}

function PrivateBookLibrary() {
  const [books, setBooks] = useState<LibraryBook[]>([])
  const [filter, setFilter] = useState<'all' | ReadingStatus>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [busyIds, setBusyIds] = useState<string[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftRating, setDraftRating] = useState<number | null>(null)
  const [draftNote, setDraftNote] = useState('')

  const loadLibrary = useCallback(async () => {
    setLoading(true)
    setError('')
    setActionError('')
    try {
      const response = await fetch('/api/v1/library')
      const payload = await response.json() as { books?: LibraryBook[]; error?: string }
      if (!response.ok) throw new Error(payload.error || 'Your library could not be loaded. Please try again.')
      setBooks((payload.books ?? []).map((book) => ({
        ...book,
        rating: book.rating ?? null,
        note: book.note ?? '',
      })))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Your library could not be loaded. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadLibrary()
  }, [loadLibrary])

  const visibleBooks = filter === 'all' ? books : books.filter((book) => book.status === filter)
  const counts = filters.reduce<Record<string, number>>((result, item) => {
    result[item.value] = item.value === 'all' ? books.length : books.filter((book) => book.status === item.value).length
    return result
  }, {})

  async function updateStatus(book: LibraryBook, status: ReadingStatus) {
    setBusyIds((current) => [...current, book.id])
    setActionError('')
    try {
      const response = await fetch(`/api/v1/library/${encodeURIComponent(book.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const payload = await response.json() as { error?: string }
      if (!response.ok) throw new Error(payload.error || 'The reading status could not be changed.')
      setBooks((current) => current.map((item) => item.id === book.id ? { ...item, status } : item))
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : 'The reading status could not be changed.')
    } finally {
      setBusyIds((current) => current.filter((id) => id !== book.id))
    }
  }

  async function removeBook(book: LibraryBook) {
    if (!window.confirm(`Remove “${book.title}” from your library?`)) return
    setBusyIds((current) => [...current, book.id])
    setActionError('')
    try {
      const response = await fetch(`/api/v1/library/${encodeURIComponent(book.id)}`, { method: 'DELETE' })
      const payload = await response.json() as { error?: string }
      if (!response.ok) throw new Error(payload.error || 'The book could not be removed. Please try again.')
      setBooks((current) => current.filter((item) => item.id !== book.id))
      window.dispatchEvent(new Event('bookhunt:library-updated'))
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : 'The book could not be removed. Please try again.')
    } finally {
      setBusyIds((current) => current.filter((id) => id !== book.id))
    }
  }

  function editReflection(book: LibraryBook) {
    setEditingId(book.id)
    setDraftRating(book.rating)
    setDraftNote(book.note)
    setActionError('')
  }

  async function saveReflection(event: FormEvent<HTMLFormElement>, book: LibraryBook) {
    event.preventDefault()
    setBusyIds((current) => [...current, book.id])
    setActionError('')
    try {
      const response = await fetch(`/api/v1/library/${encodeURIComponent(book.id)}/reflection`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: draftRating, note: draftNote }),
      })
      const payload = await response.json() as { rating?: number | null; note?: string; error?: string }
      if (!response.ok) throw new Error(payload.error || 'Your rating and note could not be saved.')
      setBooks((current) => current.map((item) => item.id === book.id
        ? { ...item, rating: payload.rating ?? null, note: payload.note ?? '' }
        : item))
      setEditingId(null)
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : 'Your rating and note could not be saved.')
    } finally {
      setBusyIds((current) => current.filter((id) => id !== book.id))
    }
  }

  return (
    <main id="library" className="main-content library-page">
      <div className="page-intro library-intro">
        <p className="eyebrow"><span aria-hidden="true" className="library-eyebrow-mark" />Private archive · Reading shelf</p>
        <div className="library-heading-row">
          <div>
            <h1>My Library</h1>
            <p className="page-description">Books you have saved, gathered in one place.</p>
          </div>
          {!loading && !error && books.length > 0 && <p className="library-total"><strong>{books.length}</strong> {books.length === 1 ? 'book saved' : 'books saved'}</p>}
        </div>
      </div>

      {!loading && !error && books.length > 0 && (
        <nav className="library-filters" aria-label="Filter books by reading status">
          {filters.map((item) => (
            <button
              type="button"
              key={item.value}
              className={`library-filter ${filter === item.value ? 'library-filter-active' : ''}`}
              aria-pressed={filter === item.value}
              onClick={() => setFilter(item.value)}
            >
              {item.label}<span className="library-filter-count">{counts[item.value]}</span>
            </button>
          ))}
        </nav>
      )}

      {loading && <div className="library-loading" role="status" aria-live="polite"><span className="library-spinner" aria-hidden="true" />Loading your library…</div>}

      {!loading && error && (
        <section className="library-message library-error" role="alert">
          <h2>Your library couldn’t load</h2><p>{error}</p>
          <button className="button button-secondary" type="button" onClick={() => void loadLibrary()}>Try again</button>
        </section>
      )}

      {!loading && !error && books.length === 0 && (
        <section className="library-message library-empty" aria-labelledby="library-empty-heading">
          <div className="empty-icon-wrap"><LibrarySymbol /></div>
          <h2 id="library-empty-heading">Your shelf is ready for its first book</h2>
          <p>Find a title you’d like to read and save it here. You can update its reading status at any time.</p>
          <a className="button button-primary" href="#discover">Discover books <span aria-hidden="true">→</span></a>
        </section>
      )}

      {!loading && !error && books.length > 0 && visibleBooks.length === 0 && (
        <section className="library-message library-filter-empty"><h2>No books in this status</h2><p>Choose another status to see more of your library.</p></section>
      )}

      {!loading && !error && actionError && <p className="library-inline-error" role="alert">{actionError}</p>}

      {!loading && !error && visibleBooks.length > 0 && (
        <section className="library-grid" aria-label="Saved books" aria-busy={busyIds.length > 0}>
          {visibleBooks.map((book) => (
            <article className="library-book-card" key={book.id}>
              <div className="library-cover-frame"><Cover book={book} /></div>
              <div className="library-book-copy">
                <h2>{book.title}</h2>
                <p className="library-author">{book.authors.length ? book.authors.join(', ') : 'Author not listed'}</p>
                {book.firstPublishedYear && <p className="library-year">First published {book.firstPublishedYear}</p>}
                <label className="library-status-label" htmlFor={`status-${book.id}`}>Reading status</label>
                <select
                  id={`status-${book.id}`}
                  value={book.status}
                  disabled={busyIds.includes(book.id)}
                  onChange={(event) => void updateStatus(book, event.target.value as ReadingStatus)}
                >
                  {Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                </select>
                {(book.rating !== null || book.note) && editingId !== book.id && (
                  <div className="library-reflection-summary">
                    {book.rating !== null && <p><span aria-hidden="true">★</span> {book.rating} out of 5</p>}
                    {book.note && <p className="library-note-preview">{book.note}</p>}
                  </div>
                )}
                {editingId === book.id ? (
                  <form className="library-reflection-form" onSubmit={(event) => void saveReflection(event, book)}>
                    <label htmlFor={`rating-${book.id}`}>Your rating</label>
                    <select
                      id={`rating-${book.id}`}
                      value={draftRating ?? ''}
                      disabled={busyIds.includes(book.id)}
                      onChange={(event) => setDraftRating(event.target.value ? Number(event.target.value) : null)}
                    >
                      <option value="">No rating</option>
                      {[1, 2, 3, 4, 5].map((value) => <option value={value} key={value}>{value} {value === 1 ? 'star' : 'stars'}</option>)}
                    </select>
                    <label htmlFor={`note-${book.id}`}>Private note</label>
                    <textarea
                      id={`note-${book.id}`}
                      value={draftNote}
                      maxLength={2000}
                      rows={4}
                      placeholder="What did you think of this book?"
                      disabled={busyIds.includes(book.id)}
                      onChange={(event) => setDraftNote(event.target.value)}
                    />
                    <p className="library-note-count">{draftNote.length} / 2000 characters</p>
                    <div className="library-reflection-actions">
                      <button className="button button-primary" type="submit" disabled={busyIds.includes(book.id) || (draftRating === book.rating && draftNote === book.note)}>
                        {busyIds.includes(book.id) ? 'Saving…' : 'Save'}
                      </button>
                      <button className="button button-text" type="button" disabled={busyIds.includes(book.id)} onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <button className="library-reflection-trigger" type="button" disabled={busyIds.includes(book.id)} onClick={() => editReflection(book)}>
                    {book.rating !== null || book.note ? 'Edit rating & note' : 'Add rating & note'}
                  </button>
                )}
                <button className="library-remove" type="button" disabled={busyIds.includes(book.id)} onClick={() => void removeBook(book)}>
                  Remove from library
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      {!loading && !error && books.length > 0 && <p className="library-attribution">Book information provided by <a href="https://openlibrary.org" target="_blank" rel="noreferrer">Open Library</a>.</p>}
    </main>
  )
}

function LibrarySymbol() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M5 4.5h14v15H5z" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>
}
