import assert from 'node:assert/strict'
import test from 'node:test'
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

test('appendPrompt starts a new line for a non-empty draft', () => {
  assert.equal(appendPrompt('', 'b'), 'b')
  assert.equal(appendPrompt('a', 'b'), 'a\nb')
  assert.equal(appendPrompt('a\n', 'b'), 'a\nb')
  assert.equal(appendPrompt('a', ''), 'a')
})

test('createPrompt normalizes tags and timestamps', () => {
  const prompt = createPrompt({ title: ' t ', body: ' b ', tags: [' a ', 'a', '', 'b'] }, 10)
  assert.equal(prompt.title, 't')
  assert.equal(prompt.body, 'b')
  assert.deepEqual(prompt.tags, ['a', 'b'])
  assert.equal(prompt.createdAt, 10)
  assert.equal(prompt.updatedAt, 10)
})

test('updatePrompt keeps identity and creation time', () => {
  const prompt = createPrompt({ title: 't', body: 'b' }, 10)
  const next = updatePrompt(prompt, { title: 't2', body: 'b2' }, 20)
  assert.equal(next.id, prompt.id)
  assert.equal(next.createdAt, 10)
  assert.equal(next.updatedAt, 20)
  assert.equal(next.title, 't2')
})

test('matchesPrompt searches title body and tags', () => {
  const prompt = createPrompt({ title: 'Alpha', body: 'beta', tags: ['Gamma'] })
  assert.equal(matchesPrompt(prompt, 'alp'), true)
  assert.equal(matchesPrompt(prompt, 'BET'), true)
  assert.equal(matchesPrompt(prompt, 'gam'), true)
  assert.equal(matchesPrompt(prompt, 'delta'), false)
})

test('containsPrompt reads the draft, ignoring line breaks and indentation', () => {
  const body = 'Summarize the diff.\n\nCall out the risks.'
  assert.equal(containsPrompt('', body), false)
  assert.equal(containsPrompt(body, body), true)
  assert.equal(containsPrompt('intro\n\n' + body, body), true)
  // The composer may reflow or re-indent a prompt the user pasted or edited.
  assert.equal(containsPrompt('  Summarize the diff.\n\n    Call out the risks. ', body), true)
  assert.equal(containsPrompt('Summarize the diff.', body), false)
  assert.equal(containsPrompt('anything', ''), false)
})

test('mergeStores upserts by id and preserves order', () => {
  const first = createPrompt({ title: 'one', body: '1' }, 1)
  const second = createPrompt({ title: 'two', body: '2' }, 1)
  const replacement: Prompt = { ...first, title: 'one-new', body: '1b', updatedAt: 2 }
  const added = createPrompt({ title: 'three', body: '3' }, 3)
  const merged = mergeStores(
    { version: 1, items: [first, second] },
    { version: 1, items: [replacement, added] }
  )
  assert.deepEqual(merged.items.map((item) => item.title), ['one-new', 'two', 'three'])
  assert.equal(merged.items[0]?.createdAt, first.createdAt)
})

test('validateStore rejects duplicates and malformed data', () => {
  const prompt = createPrompt({ title: 'one', body: '1' })
  assert.throws(() => validateStore({ version: 1, items: [prompt, prompt] }))
  assert.throws(() => validateStore({ version: 1, items: [{ id: '', title: 'x', body: 'y' }] }))
  assert.throws(() => validateStore({ version: 2, items: [] }))
})
