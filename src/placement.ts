export interface AnchorRect {
  top: number
  bottom: number
  right: number
}

export interface CardSize {
  width: number
  height: number
}

export interface ViewportSize {
  width: number
  height: number
}

export interface Placement {
  left: number
  top: number
  maxHeight: number
}

/** Gap the card keeps from the window edge. */
export const MARGIN = 12
/** Gap the card keeps from the trigger. */
export const GAP = 8
/** The card never grows taller than this, even on a tall window. */
export const MAX_HEIGHT = 560
/** Below this the card would be useless, so it wins over a cramped window. */
const MIN_HEIGHT = MARGIN * 8

/** Clamp `value` into [min, max]; a window smaller than the card wins ties. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

/**
 * Where the fixed-positioned card goes for a trigger at `anchor`, so that it
 * stays inside the viewport on every side. The card keeps its right edge on
 * the trigger's when there is room, opens upward by default, and falls back to
 * the roomier side with an internal scroll when it does not fit.
 */
export function computePlacement(
  anchor: AnchorRect,
  card: CardSize,
  viewport: ViewportSize
): Placement {
  const height = Math.min(card.height, MAX_HEIGHT, viewport.height - MARGIN * 2)
  const above = anchor.top - GAP - MARGIN
  const below = viewport.height - anchor.bottom - GAP - MARGIN
  const drop = height > above && (height <= below || below > above)
  const room = drop ? below : above
  const maxHeight = Math.min(height, Math.max(room, MIN_HEIGHT))
  const top = drop ? anchor.bottom + GAP : anchor.top - GAP - maxHeight
  return {
    left: clamp(anchor.right - card.width, MARGIN, viewport.width - MARGIN - card.width),
    top: clamp(top, MARGIN, viewport.height - MARGIN - maxHeight),
    maxHeight
  }
}
