/**
 * Screenshot storage lives in IndexedDB (localStorage can't hold images),
 * so trades stay persistable there while screenshots use the bigger quota.
 */

const DB_NAME = 'trading-journal'
const DB_VERSION = 1
const STORE = 'screenshots'

export const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024
export const MAX_SCREENSHOT_MB = 5

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB failed to open'))
  })
}

async function withStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDB()
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode)
      const req = run(tx.objectStore(STORE))
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error ?? new Error('IndexedDB request failed'))
    })
  } finally {
    db.close()
  }
}

/** Returns null when the file is acceptable, otherwise an error message. */
export function validateScreenshotFile(file: File): string | null {
  if (!file.type.startsWith('image/')) return 'Only image files are supported'
  if (file.size > MAX_SCREENSHOT_BYTES) return `Keep it under ${MAX_SCREENSHOT_MB} MB (that file is ${formatSize(file.size)})`
  return null
}

export async function saveScreenshot(blob: Blob): Promise<string> {
  const id = crypto.randomUUID()
  await withStore('readwrite', (s) => s.put(blob, id))
  return id
}

export async function loadScreenshotBlob(id: string): Promise<Blob | null> {
  try {
    const result = await withStore<Blob | undefined>('readonly', (s) => s.get(id))
    return result ?? null
  } catch {
    return null
  }
}

export async function deleteScreenshot(id: string): Promise<void> {
  try {
    await withStore('readwrite', (s) => s.delete(id))
  } catch {
    // already gone — nothing to clean up
  }
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
