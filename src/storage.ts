import { validateStore } from './model.ts'
import type { Prompt, PromptStore } from './types.ts'

export const STORAGE_KEY = 'dsh.prompt-palette.v1'

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export function loadStore(storage: StorageLike, seeds: Prompt[] = []): PromptStore {
  const raw = storage.getItem(STORAGE_KEY)
  if (raw === null) {
    const store: PromptStore = { version: 1, items: seeds }
    saveStore(store, storage)
    return store
  }
  try {
    return validateStore(JSON.parse(raw))
  } catch {
    return { version: 1, items: [] }
  }
}

export function saveStore(store: PromptStore, storage: StorageLike): void {
  validateStore(store)
  storage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function exportStore(store: PromptStore): string {
  return JSON.stringify(store, null, 2)
}

export function importStore(text: string): PromptStore {
  const parsed: unknown = JSON.parse(text)
  return validateStore(Array.isArray(parsed) ? { version: 1, items: parsed } : parsed)
}
