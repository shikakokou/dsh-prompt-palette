import assert from 'node:assert/strict'
import test from 'node:test'
import { computePlacement, GAP, MARGIN, MAX_HEIGHT } from '../src/placement.ts'

const viewport = { width: 1440, height: 900 }
const card = { width: 380, height: 320 }

/** The card's four edges once the placement is applied. */
function edges(placement: ReturnType<typeof computePlacement>, size = card) {
  return {
    left: placement.left,
    top: placement.top,
    right: placement.left + size.width,
    bottom: placement.top + placement.maxHeight
  }
}

test('computePlacement opens over the trigger and keeps every edge inside', () => {
  const placement = computePlacement({ top: 700, bottom: 728, right: 1400 }, card, viewport)
  const box = edges(placement)
  assert.equal(placement.maxHeight, card.height)
  assert.equal(box.bottom, 700 - GAP)
  assert.equal(box.right, 1400)
  assert.ok(box.left >= MARGIN && box.top >= MARGIN)
  assert.ok(box.right <= viewport.width - MARGIN)
})

test('computePlacement clamps the left edge when the trigger sits near it', () => {
  const placement = computePlacement({ top: 700, bottom: 728, right: 240 }, card, viewport)
  assert.equal(placement.left, MARGIN)
  assert.ok(edges(placement).right <= viewport.width - MARGIN)
})

test('computePlacement drops under a trigger with no room above', () => {
  const placement = computePlacement({ top: 40, bottom: 68, right: 1400 }, card, viewport)
  assert.equal(placement.top, 68 + GAP)
  assert.equal(placement.maxHeight, card.height)
})

test('computePlacement caps a tall card so it never leaves the viewport', () => {
  const tall = { width: 380, height: 1200 }
  // The room above is smaller than the card's own cap, so the card takes the
  // roomier side and the list scrolls instead of the card hanging off screen.
  const tight = computePlacement({ top: 400, bottom: 428, right: 1400 }, tall, viewport)
  assert.equal(tight.top, 428 + GAP)
  assert.equal(tight.maxHeight, viewport.height - 428 - GAP - MARGIN)
  assert.equal(tight.top + tight.maxHeight, viewport.height - MARGIN)
  // With room to spare the card stops at its own height cap.
  const roomy = computePlacement({ top: 700, bottom: 728, right: 1400 }, tall, viewport)
  assert.equal(roomy.maxHeight, MAX_HEIGHT)
  assert.equal(roomy.top + roomy.maxHeight, 700 - GAP)
})

test('computePlacement keeps the card inside a short window', () => {
  const placement = computePlacement(
    { top: 380, bottom: 408, right: 400 },
    { width: 380, height: 500 },
    { width: 420, height: 460 }
  )
  const box = edges(placement)
  assert.ok(box.top >= MARGIN)
  assert.ok(box.bottom <= 460 - MARGIN)
  assert.ok(box.left >= MARGIN)
  assert.ok(box.right <= 420 - MARGIN)
})
