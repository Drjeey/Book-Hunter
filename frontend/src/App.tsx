import { useEffect, useState } from 'react'
import './BookHunt.css'
import BookSearch from './BookSearch'
import BookLibrary from './BookLibrary'
import ProfilePage from './ProfilePage'
import ShelfScan from './ShelfScan'

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

function ScanIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" />
      <path d="M7 9h10v7H7zM10 9V7h4v2" />
    </svg>
  )
}

function Brand() {
  return (
    <a className="brand" href="#discover" aria-label="Book Hunter home">
      <BookHuntMark />
      <span className="brand-copy">
        <span className="brand-name">Book Hunter</span>
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

type Page = 'discover' | 'scan' | 'library' | 'profile'

function PrimaryNavigation({ mobile = false, activePage }: { mobile?: boolean; activePage: Page }) {
  return (
    <nav aria-label="Primary navigation" className={mobile ? 'mobile-navigation' : 'desktop-navigation'}>
      <a className={`navigation-link ${activePage === 'discover' ? 'navigation-link-active' : ''}`} href="#discover" aria-current={activePage === 'discover' ? 'page' : undefined}>
        <DiscoverIcon />
        <span>Discover</span>
      </a>
      <a className={`navigation-link ${activePage === 'scan' ? 'navigation-link-active' : ''}`} href="#scan" aria-current={activePage === 'scan' ? 'page' : undefined}>
        <ScanIcon />
        <span>Shelf Scan</span>
      </a>
      <a className={`navigation-link ${activePage === 'library' ? 'navigation-link-active' : ''}`} href="#library" aria-current={activePage === 'library' ? 'page' : undefined}>
        <LibraryIcon />
        <span>My Library</span>
      </a>
      <a className={`navigation-link ${activePage === 'profile' ? 'navigation-link-active' : ''}`} href="#profile" aria-current={activePage === 'profile' ? 'page' : undefined}>
        <ProfileIcon />
        <span>Profile</span>
      </a>
    </nav>
  )
}

function App() {
  const readPage = (): Page => {
    if (window.location.hash === '#profile') return 'profile'
    if (window.location.hash === '#library') return 'library'
    if (window.location.hash === '#scan') return 'scan'
    return 'discover'
  }
  const [activePage, setActivePage] = useState<Page>(() =>
    readPage(),
  )

  useEffect(() => {
    const syncPage = () => setActivePage(readPage())
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

      {activePage === 'profile' ? <ProfilePage /> : activePage === 'library' ? <BookLibrary /> : activePage === 'scan' ? <ShelfScan /> : <main id="discover" className="main-content">
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

        <BookSearch />
      </main>}

      <footer className="site-footer">
        <div className="footer-content">
          <div>
            <p className="footer-brand">Book Hunter</p>
            <p>A quiet place for personal literary discoveries.</p>
          </div>
          <p className="copyright">© Book Hunter. Built for quiet reading.</p>
        </div>
      </footer>

      <PrimaryNavigation mobile activePage={activePage} />
    </div>
  )
}

export default App
