import { publicSite } from './deployment'

export type TasteProfileValue = {
  favoriteGenres: string[]
  favoriteThemes: string[]
  avoidTraits: string[]
  preferredPace: 'any' | 'slow' | 'balanced' | 'fast'
  twistInterest: number | null
  psychologicalDepth: number | null
  writingStyle: 'any' | 'direct' | 'lyrical'
  updatedAt: string | null
}
export type TasteOptions = {
  genres: string[]
  themes: string[]
  avoidTraits: string[]
  paces: TasteProfileValue['preferredPace'][]
  writingStyles: TasteProfileValue['writingStyle'][]
}
export type TasteResponse = { profile: TasteProfileValue; options: TasteOptions }

const options: TasteOptions = {
  genres: ['Mystery', 'Thriller', 'Fantasy', 'Science fiction', 'Literary fiction', 'Romance', 'Historical fiction', 'Horror', 'Biography', 'Nonfiction'],
  themes: ['Identity', 'Family', 'Power', 'Survival', 'Justice', 'Love', 'Grief', 'Discovery'],
  avoidTraits: ['Graphic violence', 'Explicit content', 'Slow openings', 'Ambiguous endings', 'Heavy romance', 'Complex prose'],
  paces: ['any', 'slow', 'balanced', 'fast'],
  writingStyles: ['any', 'direct', 'lyrical'],
}
const emptyProfile: TasteProfileValue = {
  favoriteGenres: [], favoriteThemes: [], avoidTraits: [], preferredPace: 'any',
  twistInterest: null, psychologicalDepth: null, writingStyle: 'any', updatedAt: null,
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('book-hunter-browser-taste', 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('taste')) request.result.createObjectStore('taste')
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Reading taste storage could not be opened.'))
  })
}

async function serverRequest(method: 'GET' | 'PUT', profile?: TasteProfileValue): Promise<TasteResponse> {
  const response = await fetch('/api/v1/taste-profile', method === 'GET' ? undefined : {
    method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile),
  })
  const payload = await response.json().catch(() => null) as (TasteResponse & { error?: string }) | null
  if (!response.ok || !payload) throw new Error(payload?.error ?? 'Your reading preferences are unavailable. Please try again.')
  return payload
}

function validateSelection(values: string[], allowed: string[]) {
  return Array.isArray(values) && values.length <= 5
    && new Set(values).size === values.length && values.every((value) => allowed.includes(value))
}

function validate(profile: TasteProfileValue) {
  const interest = (value: number | null) => value === null || (Number.isInteger(value) && value >= 1 && value <= 5)
  if (!validateSelection(profile.favoriteGenres, options.genres)
    || !validateSelection(profile.favoriteThemes, options.themes)
    || !validateSelection(profile.avoidTraits, options.avoidTraits)
    || !options.paces.includes(profile.preferredPace)
    || !options.writingStyles.includes(profile.writingStyle)
    || !interest(profile.twistInterest) || !interest(profile.psychologicalDepth)) {
    throw new Error('Choose valid reading preferences and try again.')
  }
}

export async function loadTasteProfile(): Promise<TasteResponse> {
  if (!publicSite) return serverRequest('GET')
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('taste', 'readonly')
    const request = transaction.objectStore('taste').get('reader')
    request.onsuccess = () => resolve({ profile: request.result ?? { ...emptyProfile }, options })
    request.onerror = () => reject(request.error ?? new Error('Reading preferences could not be loaded.'))
    transaction.oncomplete = () => database.close()
    transaction.onabort = () => database.close()
  })
}

export async function saveTasteProfile(profile: TasteProfileValue): Promise<TasteResponse> {
  if (!publicSite) return serverRequest('PUT', profile)
  validate(profile)
  const saved = { ...profile, updatedAt: new Date().toISOString() }
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('taste', 'readwrite')
    transaction.objectStore('taste').put(saved, 'reader')
    transaction.oncomplete = () => { database.close(); resolve({ profile: saved, options }) }
    const fail = () => { database.close(); reject(transaction.error ?? new Error('Reading preferences could not be saved.')) }
    transaction.onerror = fail
    transaction.onabort = fail
  })
}
