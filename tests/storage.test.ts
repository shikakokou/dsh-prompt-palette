import assert from 'node:assert/strict'
import test from 'node:test'
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

test('loadStore seeds an empty storage once', () => {
  const storage = new MemoryStorage()
  const seed = createPrompt({ title: 'seed', body: 'body' })
  const first = loadStore(storage, [seed])
  assert.equal(first.items.length, 1)
  assert.notEqual(storage.getItem(STORAGE_KEY), null)
  const second = loadStore(storage, [])
  assert.equal(second.items.length, 1)
})

test('saveStore round-trips', () => {
  const storage = new MemoryStorage()
  const store = { version: 1 as const, items: [createPrompt({ title: 'one', body: '1' })] }
  saveStore(store, storage)
  assert.deepEqual(loadStore(storage), store)
})

test('importStore accepts a store and a bare array', () => {
  const prompt = createPrompt({ title: 'one', body: '1' })
  assert.equal(importStore(JSON.stringify({ version: 1, items: [prompt] })).items.length, 1)
  assert.equal(importStore(JSON.stringify([prompt])).items.length, 1)
})

test('importStore rejects malformed data', () => {
  assert.throws(() => importStore('{'))
  assert.throws(() => importStore(JSON.stringify({ version: 2, items: [] })))
})

test('loadStore recovers from corrupt data', () => {
  const storage = new MemoryStorage()
  storage.setItem(STORAGE_KEY, '{')
  assert.deepEqual(loadStore(storage), { version: 1, items: [] })
})

test('exportStore emits a file importStore reads back unchanged', () => {
  const store = { version: 1 as const, items: [createPrompt({ title: 'one', body: '1' })] }
  assert.deepEqual(importStore(exportStore(store)), store)
})
