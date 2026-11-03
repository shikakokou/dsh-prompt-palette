import { describe, expect, it } from 'vitest'
import {
  appendPrompt,
  containsPrompt,
  createPrompt,
  matchesPrompt,
  mergeStores,
  updatePrompt,
  validateStore
} from '../src/model.ts'
import type { Prompt } from '../src/types.ts'

describe('model', () => {
  it('appendPrompt starts a new line for a non-empty draft', () => {
    expect(appendPrompt('', 'b')).toBe('b')
    expect(appendPrompt('a', 'b')).toBe('a\nb')
    expect(appendPrompt('a\n', 'b')).toBe('a\nb')
    expect(appendPrompt('a', '')).toBe('a')
  })

  it('createPrompt normalizes tags and timestamps', () => {
    const prompt = createPrompt({ title: ' t ', body: ' b ', tags: [' a ', 'a', '', 'b'] }, 10)
    expect(prompt.title).toBe('t')
    expect(prompt.body).toBe('b')
    expect(prompt.tags).toEqual(['a', 'b'])
    expect(prompt.createdAt).toBe(10)
    expect(prompt.updatedAt).toBe(10)
  })

  it('updatePrompt keeps identity and creation time', () => {
    const prompt = createPrompt({ title: 't', body: 'b' }, 10)
    const next = updatePrompt(prompt, { title: 't2', body: 'b2' }, 20)
    expect(next.id).toBe(prompt.id)
    expect(next.createdAt).toBe(10)
    expect(next.updatedAt).toBe(20)
    expect(next.title).toBe('t2')
  })

  it('matchesPrompt searches title body and tags', () => {
    const prompt = createPrompt({ title: 'Alpha', body: 'beta', tags: ['Gamma'] })
    expect(matchesPrompt(prompt, 'alp')).toBe(true)
    expect(matchesPrompt(prompt, 'BET')).toBe(true)
    expect(matchesPrompt(prompt, 'gam')).toBe(true)
    expect(matchesPrompt(prompt, 'delta')).toBe(false)
  })

  it('containsPrompt reads the draft, ignoring line breaks and indentation', () => {
    const body = 'Summarize the diff.\n\nCall out the risks.'
    expect(containsPrompt('', body)).toBe(false)
    expect(containsPrompt(body, body)).toBe(true)
    expect(containsPrompt('intro\n\n' + body, body)).toBe(true)
    // The composer may reflow or re-indent a prompt the user pasted or edited.
    expect(containsPrompt('  Summarize the diff.\n\n    Call out the risks. ', body)).toBe(true)
    expect(containsPrompt('Summarize the diff.', body)).toBe(false)
    expect(containsPrompt('anything', '')).toBe(false)
  })

  it('mergeStores upserts by id and preserves order', () => {
    const first = createPrompt({ title: 'one', body: '1' }, 1)
    const second = createPrompt({ title: 'two', body: '2' }, 1)
    const replacement: Prompt = { ...first, title: 'one-new', body: '1b', updatedAt: 2 }
    const added = createPrompt({ title: 'three', body: '3' }, 3)
    const merged = mergeStores(
      { version: 1, items: [first, second] },
      { version: 1, items: [replacement, added] }
    )
    expect(merged.items.map((item) => item.title)).toEqual(['one-new', 'two', 'three'])
    expect(merged.items[0]?.createdAt).toBe(first.createdAt)
  })

  it('validateStore rejects duplicates and malformed data', () => {
    const prompt = createPrompt({ title: 'one', body: '1' })
    expect(() => validateStore({ version: 1, items: [prompt, prompt] })).toThrow()
    expect(() => validateStore({ version: 1, items: [{ id: '', title: 'x', body: 'y' }] })).toThrow()
    expect(() => validateStore({ version: 2, items: [] })).toThrow()
  })
})
