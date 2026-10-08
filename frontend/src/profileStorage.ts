export type ReaderProfile = {
  displayName: string
  avatar: Blob | null
}

const databaseName = 'book-hunt'
const storeName = 'profile'
const profileKey = 'reader'

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1)

    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(storeName)) {
        request.result.createObjectStore(storeName)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Could not open profile storage.'))
  })
}

export async function loadReaderProfile(): Promise<ReaderProfile> {
  const database = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly')
    const request = transaction.objectStore(storeName).get(profileKey)

    request.onsuccess = () => {
      const profile = request.result as ReaderProfile | undefined
      resolve(profile ?? { displayName: '', avatar: null })
    }
    request.onerror = () => reject(request.error ?? new Error('Could not load your profile.'))
    transaction.oncomplete = () => database.close()
    transaction.onerror = () => database.close()
  })
}

export async function saveReaderProfile(profile: ReaderProfile): Promise<void> {
  const database = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite')
    transaction.objectStore(storeName).put(profile, profileKey)

    transaction.oncomplete = () => {
      database.close()
      resolve()
    }
    transaction.onerror = () => {
      database.close()
      reject(transaction.error ?? new Error('Could not save your profile.'))
    }
    transaction.onabort = () => {
      database.close()
      reject(transaction.error ?? new Error('Profile saving was cancelled.'))
    }
  })
}
