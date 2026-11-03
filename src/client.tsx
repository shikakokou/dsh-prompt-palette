import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { LIMITS, appendPrompt, containsPrompt, createPrompt, matchesPrompt, mergeStores, updatePrompt } from './model.ts'
import { computePlacement, type Placement } from './placement.ts'
import { exportStore, importStore, loadStore, saveStore } from './storage.ts'
import seed from './seed.json'
import zh from './locales/zh.json'
import en from './locales/en.json'
import styles from './styles.css?raw'
import { Editor } from './editor.tsx'
import type {
  ClientContext,
  InputActions,
  InputState,
  Prompt,
  PromptInput,
  PromptStore,
  SlotProps
} from './types.ts'

const NS = 'dsh-prompt-palette'

const ICON_PROMPT = 'M4 5h16M4 11h10M4 17h13'
const ICON_PLUS = 'M12 5v14M5 12h14'
const ICON_X = 'M6 6l12 12M18 6 6 18'
const ICON_COPY = 'M8 8h11v12H8zM5 16H4V4h11v2'
const ICON_CHECK = 'M5 12l5 5L20 7'
const ICON_PENCIL = 'M4 20l4-1L19 8l-3-3L5 16z'
const ICON_TRASH = 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3'
const ICON_UPLOAD = 'M12 20V10M8 14l4-4 4 4M5 4h14'
const ICON_DOWNLOAD = 'M12 4v10M8 10l4 4 4-4M5 20h14'

function Icon({ d }: { d: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  )
}

function readStore(): PromptStore {
  try {
    return loadStore(window.localStorage, [createPrompt(seed)])
  } catch {
    return { version: 1, items: [] }
  }
}

function summary(body: string): string {
  return body.replace(/\s+/g, ' ').trim().slice(0, 140)
}

interface ButtonProps extends SlotProps {
  t: (key: string) => string
  useLocale: () => number
}

function PromptButton({ t, useLocale, useInput, inputActions }: ButtonProps) {
  useLocale()
  const input = useInput((state) => state)
  const [open, setOpen] = useState(false)
  const [store, setStore] = useState<PromptStore>(readStore)
  const anchor = useRef<HTMLButtonElement>(null)
  const close = useCallback(() => setOpen(false), [])

  const commit = (next: PromptStore) => {
    try {
      saveStore(next, window.localStorage)
    } catch {}
    setStore(next)
  }

  return (
    <>
      <button
        ref={anchor}
        type="button"
        className="pp-trigger"
        aria-label={t('trigger')}
        title={t('trigger')}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon d={ICON_PROMPT} />
      </button>
      {open && (
        <PromptPanel
          anchor={anchor}
          store={store}
          onChange={commit}
          input={input}
          inputActions={inputActions}
          onClose={close}
          t={t}
          useLocale={useLocale}
        />
      )}
    </>
  )
}

interface PanelProps {
  anchor: React.RefObject<HTMLButtonElement>
  store: PromptStore
  onChange: (store: PromptStore) => void
  input: InputState
  inputActions?: InputActions
  onClose: () => void
  t: (key: string) => string
  useLocale: () => number
}

function PromptPanel({
  anchor,
  store,
  onChange,
  input,
  inputActions,
  onClose,
  t,
  useLocale
}: PanelProps) {
  useLocale()
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState('')
  const [draft, setDraft] = useState<{ id?: string; value: PromptInput } | null>(null)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [position, setPosition] = useState<Placement | null>(null)
  const panel = useRef<HTMLElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  // The card portals to body, so "inside" is the card plus the trigger that
  // owns it. Any other pointerdown dismisses the palette, same as the X.
  useEffect(() => {
    const dismissOutside = (event: PointerEvent): void => {
      if (!(event.target instanceof Node)) return
      if (panel.current?.contains(event.target) === true) return
      if (anchor.current?.contains(event.target) === true) return
      onClose()
    }
    document.addEventListener('pointerdown', dismissOutside)
    return () => document.removeEventListener('pointerdown', dismissOutside)
  }, [anchor, onClose])

  useLayoutEffect(() => {
    const place = (): void => {
      const element = panel.current
      const rect = anchor.current?.getBoundingClientRect()
      if (!element || !rect) return
      let height = element.offsetHeight
      for (const child of Array.from(element.children)) {
        if (!(child instanceof HTMLElement)) continue
        height += Math.max(0, child.scrollHeight - child.clientHeight)
      }
      const next = computePlacement(
        { top: rect.top, bottom: rect.bottom, right: rect.right },
        { width: element.offsetWidth, height },
        { width: window.innerWidth, height: window.innerHeight }
      )
      setPosition((current) =>
        current !== null &&
        current.left === next.left &&
        current.top === next.top &&
        current.maxHeight === next.maxHeight
          ? current
          : next
      )
    }
    place()
    const onScroll = (event: Event): void => {
      if (event.target instanceof Node && panel.current?.contains(event.target) === true) {
        return
      }
      place()
    }
    window.addEventListener('resize', place)
    window.addEventListener('scroll', onScroll, true)
    const observer =
      typeof ResizeObserver === 'function' ? new ResizeObserver(place) : null
    if (panel.current !== null) observer?.observe(panel.current)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', onScroll, true)
      observer?.disconnect()
    }
  }, [anchor])

  const tags = useMemo(
    () => [...new Set(store.items.flatMap((item) => item.tags))].sort(),
    [store.items]
  )

  const full = store.items.length >= LIMITS.items

  const visible = useMemo(
    () =>
      store.items.filter(
        (item) =>
          (!activeTag || item.tags.includes(activeTag)) && matchesPrompt(item, query)
      ),
    [store.items, activeTag, query]
  )

  const locked =
    !inputActions || input.phase === 'adjudicating' || input.phase === 'submitting'

  const insert = (prompt: Prompt) => {
    if (!inputActions) return
    inputActions.setDraft(appendPrompt(input.draft, prompt.body))
    onClose()
  }

  const copy = async (prompt: Prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.body)
      setCopiedId(prompt.id)
      window.setTimeout(
        () => setCopiedId((current) => (current === prompt.id ? null : current)),
        1200
      )
    } catch {
      setError(t('copyFailed'))
    }
  }

  const save = (value: PromptInput) => {
    try {
      if (draft?.id) {
        onChange({
          ...store,
          items: store.items.map((item) =>
            item.id === draft.id ? updatePrompt(item, value) : item
          )
        })
      } else {
        onChange({ ...store, items: [...store.items, createPrompt(value)] })
      }
      setDraft(null)
      setError('')
    } catch {
      setError(t('saveFailed'))
    }
  }

  const remove = (id: string) => {
    onChange({ ...store, items: store.items.filter((item) => item.id !== id) })
    setPendingDelete(null)
  }

  const onImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const merged = mergeStores(store, importStore(await file.text()))
      if (merged.items.length > LIMITS.items) {
        setError(t('tooManyItems').replace('{max}', String(LIMITS.items)))
        return
      }
      onChange(merged)
      setError('')
    } catch {
      setError(t('importFailed'))
    }
  }

  const onExport = () => {
    const url = URL.createObjectURL(
      new Blob([exportStore(store)], { type: 'application/json' })
    )
    const link = document.createElement('a')
    link.href = url
    link.download = 'prompts.json'
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  return createPortal(
    <section
      ref={panel}
      className="pp-panel"
      style={
        position === null
          ? { visibility: 'hidden' }
          : { left: position.left, top: position.top, maxHeight: position.maxHeight }
      }
      role="dialog"
      aria-label={t('title')}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return
        event.stopPropagation()
        if (draft || pendingDelete) {
          setDraft(null)
          setPendingDelete(null)
        } else {
          onClose()
        }
      }}
    >
      <header className="pp-header">
        <strong>{draft ? (draft.id ? t('edit') : t('new')) : t('title')}</strong>
        <div className="pp-header-actions">
          {!draft && (
            <>
              <button
                type="button"
                className="pp-icon"
                aria-label={t('new')}
                title={
                  full ? t('itemsFull').replace('{max}', String(LIMITS.items)) : t('new')
                }
                disabled={full}
                onClick={() => setDraft({ value: { title: '', body: '', tags: [] } })}
              >
                <Icon d={ICON_PLUS} />
              </button>
              <button
                type="button"
                className="pp-icon"
                aria-label={t('import')}
                title={t('import')}
                onClick={() => fileInput.current?.click()}
              >
                <Icon d={ICON_UPLOAD} />
              </button>
              <button
                type="button"
                className="pp-icon"
                aria-label={t('export')}
                title={t('export')}
                onClick={onExport}
              >
                <Icon d={ICON_DOWNLOAD} />
              </button>
            </>
          )}
          <button
            type="button"
            className="pp-icon"
            aria-label={t('close')}
            title={t('close')}
            onClick={onClose}
          >
            <Icon d={ICON_X} />
          </button>
        </div>
      </header>
      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={onImport}
      />
      {draft ? (
        <Editor
          value={draft.value}
          onSave={save}
          onCancel={() => setDraft(null)}
          t={t}
        />
      ) : pendingDelete ? (
        <div className="pp-confirm">
          <p>{t('confirmDelete')}</p>
          <footer>
            <button
              type="button"
              className="pp-button"
              onClick={() => setPendingDelete(null)}
            >
              {t('cancel')}
            </button>
            <button
              type="button"
              className="pp-button pp-danger"
              onClick={() => remove(pendingDelete)}
            >
              {t('delete')}
            </button>
          </footer>
        </div>
      ) : (
        <>
          <input
            className="pp-search"
            value={query}
            placeholder={t('search')}
            aria-label={t('search')}
            autoFocus
            onChange={(event) => setQuery(event.target.value)}
          />
          {tags.length > 0 && (
            <div className="pp-tags">
              <button
                type="button"
                className="pp-tag"
                data-active={activeTag === '' ? 'true' : 'false'}
                onClick={() => setActiveTag('')}
              >
                {t('allTags')}
              </button>
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="pp-tag"
                  data-active={activeTag === tag ? 'true' : 'false'}
                  onClick={() => setActiveTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
          {error && (
            <p className="pp-error" role="alert">
              {error}
            </p>
          )}
          {visible.length > 0 ? (
            <ul className="pp-list">
              {visible.map((prompt) => {
                const inserted = containsPrompt(input.draft, prompt.body)
                return (
                  <li key={prompt.id} className="pp-row">
                    <button
                      type="button"
                      className="pp-pick"
                      disabled={locked}
                      title={prompt.body}
                      onClick={() => insert(prompt)}
                    >
                      <span className="pp-row-title">
                        <span className="pp-row-title-text">{prompt.title}</span>
                        {inserted && <em className="pp-badge">{t('inserted')}</em>}
                      </span>
                      <span className="pp-row-body">{summary(prompt.body)}</span>
                      {prompt.tags.length > 0 && (
                        <span className="pp-row-tags">
                          {prompt.tags.map((tag) => (
                            <span key={tag}>{tag}</span>
                          ))}
                        </span>
                      )}
                    </button>
                    <span className="pp-row-actions">
                      <button
                        type="button"
                        className="pp-icon"
                        aria-label={t('copy')}
                        title={copiedId === prompt.id ? t('copied') : t('copy')}
                        onClick={() => void copy(prompt)}
                      >
                        <Icon d={copiedId === prompt.id ? ICON_CHECK : ICON_COPY} />
                      </button>
                      <button
                        type="button"
                        className="pp-icon"
                        aria-label={t('edit')}
                        title={t('edit')}
                        onClick={() =>
                          setDraft({
                            id: prompt.id,
                            value: {
                              title: prompt.title,
                              body: prompt.body,
                              tags: prompt.tags
                            }
                          })
                        }
                      >
                        <Icon d={ICON_PENCIL} />
                      </button>
                      <button
                        type="button"
                        className="pp-icon"
                        aria-label={t('delete')}
                        title={t('delete')}
                        onClick={() => setPendingDelete(prompt.id)}
                      >
                        <Icon d={ICON_TRASH} />
                      </button>
                    </span>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="pp-empty">
              {store.items.length === 0 ? t('empty') : t('noResults')}
            </p>
          )}
          <footer className="pp-footer" data-full={full ? 'true' : 'false'}>
            {t('count')
              .replace('{count}', String(store.items.length))
              .replace('{max}', String(LIMITS.items))}
          </footer>
        </>
      )}
    </section>,
    document.body
  )
}

export const inject = ['slots', 'locale']

export function apply(ctx: ClientContext) {
  ctx.effect(
    () => ctx.locale.register(NS, { zh, en }),
    'dsh-prompt-palette: dictionaries'
  )
  ctx.effect(() => {
    const style = document.createElement('style')
    style.dataset.plugin = NS
    style.textContent = styles
    document.head.append(style)
    return () => style.remove()
  }, 'dsh-prompt-palette: styles')

  const t = ctx.locale.bind(NS)
  const useLocale = () =>
    React.useSyncExternalStore(
      (notify) => ctx.locale.subscribe(notify),
      () => ctx.locale.getSnapshot().revision
    )

  ctx.slots.inject('conversation.input.right', () =>
    ctx.slots.register(
      { name: 'conversation.input.right', id: NS, order: 100 },
      (props) => <PromptButton {...props} t={t} useLocale={useLocale} />
    )
  )
}
