import { describe, expect, it } from 'vitest'
import { createPrompt } from '../src/model.ts'
import {
  exportStore,
  importStore,
  loadStore,
  saveStore,
  STORAGE_KEY,
  type StorageLike
} from '../src/storage.ts'

class MemoryStorage implements StorageLike {
  private readonly data = new Map<string, string>()

  getItem(key: string): string | null {
    return this.data.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value)
  }
}

describe('storage', () => {
  it('loadStore seeds an empty storage once', () => {
    const storage = new MemoryStorage()
    const seed = createPrompt({ title: 'seed', body: 'body' })
    const first = loadStore(storage, [seed])
    expect(first.items.length).toBe(1)
    expect(storage.getItem(STORAGE_KEY)).not.toBeNull()
    const second = loadStore(storage, [])
    expect(second.items.length).toBe(1)
  })

  it('saveStore round-trips', () => {
    const storage = new MemoryStorage()
    const store = { version: 1 as const, items: [createPrompt({ title: 'one', body: '1' })] }
    saveStore(store, storage)
    expect(loadStore(storage)).toEqual(store)
  })

  it('importStore accepts a store and a bare array', () => {
    const prompt = createPrompt({ title: 'one', body: '1' })
    expect(importStore(JSON.stringify({ version: 1, items: [prompt] })).items.length).toBe(1)
    expect(importStore(JSON.stringify([prompt])).items.length).toBe(1)
  })

  it('importStore rejects malformed data', () => {
    expect(() => importStore('{')).toThrow()
    expect(() => importStore(JSON.stringify({ version: 2, items: [] }))).toThrow()
  })

  it('loadStore recovers from corrupt data', () => {
    const storage = new MemoryStorage()
    storage.setItem(STORAGE_KEY, '{')
    expect(loadStore(storage)).toEqual({ version: 1, items: [] })
  })

  it('exportStore emits a file importStore reads back unchanged', () => {
    const store = { version: 1 as const, items: [createPrompt({ title: 'one', body: '1' })] }
    expect(importStore(exportStore(store))).toEqual(store)
  })
})
