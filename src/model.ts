import type { Prompt, PromptInput, PromptStore } from './types.ts'

export const LIMITS = Object.freeze({
  items: 200,
  title: 80,
  body: 20000,
  tags: 10
})

/** A limit the current input is breaking, as a message key plus its number. */
export interface InputProblem {
  key: string
  limit?: number
}

/**
 * What is wrong with `input`, in the order the fields appear, so the editor and
 * the store agree on the same limits instead of failing silently on save.
 */
export function limitHit(input: PromptInput): InputProblem | null {
  const title = input.title.trim()
  const body = input.body.trim()
  const tags = new Set((input.tags ?? []).map((tag) => tag.trim()).filter(Boolean))
  if (!title) return { key: 'titleRequired' }
  if (title.length > LIMITS.title) return { key: 'titleTooLong', limit: LIMITS.title }
  if (!body) return { key: 'bodyRequired' }
  if (body.length > LIMITS.body) return { key: 'bodyTooLong', limit: LIMITS.body }
  if (tags.size > LIMITS.tags) return { key: 'tooManyTags', limit: LIMITS.tags }
  return null
}

export function appendPrompt(draft: string, body: string): string {
  if (!body) return draft
  if (!draft) return body
  return draft.endsWith('\n') ? draft + body : draft + '\n' + body
}

export function matchesPrompt(prompt: Prompt, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return [prompt.title, prompt.body, ...prompt.tags].some((value) => value.toLowerCase().includes(needle))
}

/** Collapse whitespace runs so text compares equal across soft wraps and re-indentation. */
function collapse(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

/**
 * Whether the composer draft already carries `body`. The marker is derived from
 * the text in the input box, not from a click, so editing or clearing the draft
 * changes it without touching the store.
 */
export function containsPrompt(draft: string, body: string): boolean {
  const needle = collapse(body)
  if (!needle) return false
  return collapse(draft).includes(needle)
}

function normalize(input: PromptInput): Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'> {
  const title = input.title.trim()
  const body = input.body.trim()
  const tags = [...new Set((input.tags ?? []).map((tag) => tag.trim()).filter(Boolean))].slice(0, LIMITS.tags)
  if (!title) throw new Error('Title is required')
  if (title.length > LIMITS.title) throw new Error(`Title exceeds ${LIMITS.title} characters`)
  if (!body) throw new Error('Body is required')
  if (body.length > LIMITS.body) throw new Error(`Body exceeds ${LIMITS.body} characters`)
  return { title, body, tags }
}

export function createPrompt(input: PromptInput, now = Date.now()): Prompt {
  return { id: crypto.randomUUID(), ...normalize(input), createdAt: now, updatedAt: now }
}

export function updatePrompt(prompt: Prompt, input: PromptInput, now = Date.now()): Prompt {
  return { ...prompt, ...normalize(input), updatedAt: now }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function validateStore(value: unknown): PromptStore {
  if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.items)) throw new Error('Invalid store')
  if (value.items.length > LIMITS.items) throw new Error(`Store exceeds ${LIMITS.items} prompts`)
  const ids = new Set<string>()
  const items = value.items.map((item): Prompt => {
    if (!isRecord(item) || typeof item.id !== 'string' || !item.id || ids.has(item.id)) {
      throw new Error('Invalid prompt id')
    }
    if (typeof item.title !== 'string' || typeof item.body !== 'string') throw new Error('Invalid prompt')
    const tags = Array.isArray(item.tags)
      ? item.tags.filter((tag): tag is string => typeof tag === 'string')
      : []
    const normalized = normalize({ title: item.title, body: item.body, tags })
    ids.add(item.id)
    return {
      id: item.id,
      ...normalized,
      createdAt: typeof item.createdAt === 'number' ? item.createdAt : 0,
      updatedAt: typeof item.updatedAt === 'number' ? item.updatedAt : 0
    }
  })
  return { version: 1, items }
}

export function mergeStores(current: PromptStore, incoming: PromptStore): PromptStore {
  const items = new Map(current.items.map((item) => [item.id, item]))
  for (const item of incoming.items) {
    const existing = items.get(item.id)
    items.set(item.id, existing ? { ...item, createdAt: existing.createdAt } : item)
  }
  return { version: 1, items: [...items.values()] }
}
