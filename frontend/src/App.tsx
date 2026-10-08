import { useEffect, useState } from 'react'
import './BookHunt.css'
import ProfilePage from './ProfilePage'

function BookHuntMark() {
  return (
    <svg aria-hidden="true" className="brand-mark" viewBox="0 0 48 48" fill="none">
      <path d="M7 11.5c6.4-2.1 12.1-.9 17 3.2v25c-4.9-4.1-10.6-5.3-17-3.2v-25Z" />
      <path d="M41 11.5c-6.4-2.1-12.1-.9-17 3.2v25c4.9-4.1 10.6-5.3 17-3.2v-25Z" />
      <circle cx="34" cy="16" r="7.2" />
      <path d="m39.2 21.2 5.3 5.3" />
    </svg>
  )
}

function DiscoverIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M4 5.5c3.2-1.1 5.9-.4 8 1.6v12c-2.1-2-4.8-2.7-8-1.6v-12Z" />
      <path d="M20 5.5c-3.2-1.1-5.9-.4-8 1.6v12c2.1-2 4.8-2.7 8-1.6v-12Z" />
    </svg>
  )
}

function LibraryIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M5 4.5h14v15H5z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <circle cx="10.8" cy="10.8" r="6.3" />
      <path d="m15.5 15.5 4.2 4.2" />
    </svg>
  )
}

function Brand() {
  return (
    <a className="brand" href="#discover" aria-label="Book Hunt home">
      <BookHuntMark />
      <span className="brand-copy">
        <span className="brand-name">Book Hunt</span>
        <span className="brand-tagline">Your private reading companion</span>
      </span>
    </a>
  )
}

function ProfileIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.8 20c.7-3.5 3.2-5.5 7.2-5.5s6.5 2 7.2 5.5" />
    </svg>
  )
}

function PrimaryNavigation({ mobile = false, activePage }: { mobile?: boolean; activePage: 'discover' | 'profile' }) {
  return (
    <nav aria-label="Primary navigation" className={mobile ? 'mobile-navigation' : 'desktop-navigation'}>
      <a className={`navigation-link ${activePage === 'discover' ? 'navigation-link-active' : ''}`} href="#discover" aria-current={activePage === 'discover' ? 'page' : undefined}>
        <DiscoverIcon />
        <span>Discover</span>
      </a>
      <span className="navigation-link navigation-link-disabled" aria-disabled="true">
        <LibraryIcon />
        <span>My Library</span>
        {mobile ? (
          <span className="visually-hidden">Coming soon</span>
        ) : (
          <span className="coming-soon">Coming soon</span>
        )}
      </span>
      <a className={`navigation-link ${activePage === 'profile' ? 'navigation-link-active' : ''}`} href="#profile" aria-current={activePage === 'profile' ? 'page' : undefined}>
        <ProfileIcon />
        <span>Profile</span>
      </a>
    </nav>
  )
}

function SearchPanel() {
  return (
    <section aria-labelledby="search-heading" className="search-section">
      <h2 id="search-heading">Search by title or author</h2>
      <p className="search-description">Book search will be added in the next feature step.</p>
      <form className="search-form" role="search">
        <label className="search-field">
          <SearchIcon />
          <span className="visually-hidden">Search for a book by title or author</span>
          <input
            type="search"
            placeholder="e.g., Virginia Woolf, Middlemarch, or Invisible Man"
            disabled
          />
        </label>
        <button className="search-button" type="button" disabled>
          Search <span aria-hidden="true">→</span>
        </button>
      </form>
    </section>
  )
}

function EmptyState() {
  return (
    <section aria-labelledby="empty-heading" className="empty-state">
      <div className="empty-icon-wrap">
        <BookHuntMark />
      </div>
      <h2 id="empty-heading">Your reading shelf is waiting</h2>
      <p>
        Once book search is ready, you’ll be able to find titles and save the ones you
        want to remember in your private collection.
      </p>
      <div className="privacy-note">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
          <rect x="5" y="10" width="14" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" />
        </svg>
        <span>One private library. No public profile.</span>
      </div>
    </section>
  )
}

function App() {
  const [activePage, setActivePage] = useState<'discover' | 'profile'>(() =>
    window.location.hash === '#profile' ? 'profile' : 'discover',
  )

  useEffect(() => {
    const syncPage = () => setActivePage(window.location.hash === '#profile' ? 'profile' : 'discover')
    window.addEventListener('hashchange', syncPage)
    return () => window.removeEventListener('hashchange', syncPage)
  }, [])

  return (
    <div className="app-shell min-h-screen bg-paper text-ink">
      <header className="site-header">
        <div className="header-content">
          <Brand />
          <PrimaryNavigation activePage={activePage} />
        </div>
      </header>

      {activePage === 'profile' ? <ProfilePage /> : <main id="discover" className="main-content">
        <div className="page-intro">
          <p className="eyebrow">
            <DiscoverIcon />
            <span>Catalogue search · Private archive</span>
          </p>
          <h1>Find books to read and track</h1>
          <p className="page-description">
            Your private, single-user reading companion. Find a book by title or author
            and build a collection that reflects your taste.
          </p>
        </div>

        <SearchPanel />
        <EmptyState />
      </main>}

      <footer className="site-footer">
        <div className="footer-content">
          <div>
            <p className="footer-brand">Book Hunt</p>
            <p>A quiet place for personal literary discoveries.</p>
          </div>
          <p className="copyright">© Book Hunt. Built for quiet reading.</p>
        </div>
      </footer>

      <PrimaryNavigation mobile activePage={activePage} />
    </div>
  )
}

export default App
