import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'paintine_idle'
const DB_VERSION = 1
const STORE_NAME = 'saves'
const SAVE_KEY = 'current'
const LS_KEY = 'croissant_idle_save'

// ─── IndexedDB instance ─────────────────────────────────────────

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
        }
      },
    })
  }
  return dbPromise
}

// ─── Feature detection ──────────────────────────────────────────

let _useIndexedDB: boolean | null = null

async function canUseIndexedDB(): Promise<boolean> {
  if (_useIndexedDB !== null) return _useIndexedDB
  try {
    const db = await getDB()
    // Quick write/read test
    await db.put(STORE_NAME, 'test', '__probe__')
    await db.delete(STORE_NAME, '__probe__')
    _useIndexedDB = true
  } catch {
    _useIndexedDB = false
  }
  return _useIndexedDB
}

// ─── Public API ─────────────────────────────────────────────────

/** Load save data. Migrates from localStorage to IndexedDB on first call. */
export async function loadSaveData(): Promise<string | null> {
  if (await canUseIndexedDB()) {
    const db = await getDB()
    const data = await db.get(STORE_NAME, SAVE_KEY) as string | undefined

    if (!data) {
      // Check localStorage for migration
      const lsData = localStorage.getItem(LS_KEY)
      if (lsData) {
        await db.put(STORE_NAME, lsData, SAVE_KEY)
        localStorage.removeItem(LS_KEY)
        return lsData
      }
      return null
    }
    return data
  }

  // Fallback: localStorage
  return localStorage.getItem(LS_KEY)
}

/** Persist save data. */
export async function writeSaveData(json: string): Promise<void> {
  if (await canUseIndexedDB()) {
    const db = await getDB()
    await db.put(STORE_NAME, json, SAVE_KEY)
    return
  }
  localStorage.setItem(LS_KEY, json)
}

/** Delete save data from all backends. */
export async function deleteSaveData(): Promise<void> {
  localStorage.removeItem(LS_KEY)
  try {
    if (await canUseIndexedDB()) {
      const db = await getDB()
      await db.delete(STORE_NAME, SAVE_KEY)
    }
  } catch {
    // Ignore — localStorage was already cleared
  }
}
