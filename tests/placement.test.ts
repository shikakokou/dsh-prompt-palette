import { describe, expect, it } from 'vitest'
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

describe('placement', () => {
  it('computePlacement opens over the trigger and keeps every edge inside', () => {
    const placement = computePlacement({ top: 700, bottom: 728, right: 1400 }, card, viewport)
    const box = edges(placement)
    expect(placement.maxHeight).toBe(card.height)
    expect(box.bottom).toBe(700 - GAP)
    expect(box.right).toBe(1400)
    expect(box.left).toBeGreaterThanOrEqual(MARGIN)
    expect(box.top).toBeGreaterThanOrEqual(MARGIN)
    expect(box.right).toBeLessThanOrEqual(viewport.width - MARGIN)
  })

  it('computePlacement clamps the left edge when the trigger sits near it', () => {
    const placement = computePlacement({ top: 700, bottom: 728, right: 240 }, card, viewport)
    expect(placement.left).toBe(MARGIN)
    expect(edges(placement).right).toBeLessThanOrEqual(viewport.width - MARGIN)
  })

  it('computePlacement drops under a trigger with no room above', () => {
    const placement = computePlacement({ top: 40, bottom: 68, right: 1400 }, card, viewport)
    expect(placement.top).toBe(68 + GAP)
    expect(placement.maxHeight).toBe(card.height)
  })

  it('computePlacement caps a tall card so it never leaves the viewport', () => {
    const tall = { width: 380, height: 1200 }
    // The room above is smaller than the card's own cap, so the card takes the
    // roomier side and the list scrolls instead of the card hanging off screen.
    const tight = computePlacement({ top: 400, bottom: 428, right: 1400 }, tall, viewport)
    expect(tight.top).toBe(428 + GAP)
    expect(tight.maxHeight).toBe(viewport.height - 428 - GAP - MARGIN)
    expect(tight.top + tight.maxHeight).toBe(viewport.height - MARGIN)
    // With room to spare the card stops at its own height cap.
    const roomy = computePlacement({ top: 700, bottom: 728, right: 1400 }, tall, viewport)
    expect(roomy.maxHeight).toBe(MAX_HEIGHT)
    expect(roomy.top + roomy.maxHeight).toBe(700 - GAP)
  })

  it('computePlacement keeps the card inside a short window', () => {
    const placement = computePlacement(
      { top: 380, bottom: 408, right: 400 },
      { width: 380, height: 500 },
      { width: 420, height: 460 }
    )
    const box = edges(placement)
    expect(box.top).toBeGreaterThanOrEqual(MARGIN)
    expect(box.bottom).toBeLessThanOrEqual(460 - MARGIN)
    expect(box.left).toBeGreaterThanOrEqual(MARGIN)
    expect(box.right).toBeLessThanOrEqual(420 - MARGIN)
  })
})
