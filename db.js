// IndexedDB offline cache using idb
import { openDB } from 'idb'

const DB_NAME = 'private-lobby-cache'
const DB_VERSION = 1

export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('notes')) {
        const store = db.createObjectStore('notes', { keyPath: 'id' })
        store.createIndex('created_at', 'created_at')
      }
      if (!db.objectStoreNames.contains('profile')) {
        db.createObjectStore('profile', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('recently_viewed')) {
        db.createObjectStore('recently_viewed', { keyPath: 'id' })
      }
    }
  })
}

export async function cacheNotes(notes) {
  const db = await getDB()
  const tx = db.transaction('notes', 'readwrite')
  await Promise.all(notes.map(n => tx.store.put(n)))
  await tx.done
}

export async function getCachedNotes() {
  const db = await getDB()
  return db.getAllFromIndex('notes', 'created_at')
}

export async function addRecentlyViewed(note) {
  const db = await getDB()
  await db.put('recently_viewed', { ...note, viewed_at: Date.now() })
}

export async function getRecentlyViewed() {
  const db = await getDB()
  const all = await db.getAll('recently_viewed')
  return all.sort((a, b) => b.viewed_at - a.viewed_at).slice(0, 10)
}
