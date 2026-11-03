import type { ReactElement } from 'react'

export interface PromptInput {
  title: string
  body: string
  tags?: string[]
}

export interface Prompt {
  id: string
  title: string
  body: string
  tags: string[]
  createdAt: number
  updatedAt: number
}

export interface PromptStore {
  version: 1
  items: Prompt[]
}

export interface InputState {
  draft: string
  phase?: string
}

export interface InputActions {
  setDraft(text: string): void
}

export interface SlotProps {
  useInput<T>(selector: (state: InputState) => T): T
  inputActions?: InputActions
}

export interface LocaleApi {
  register(ns: string, dicts: Record<string, Record<string, string>>): () => void
  bind(ns: string): (key: string) => string
  subscribe(listener: () => void): () => void
  getSnapshot(): { active: string; revision: number }
}

export interface SlotsApi {
  inject(key: string, callback: () => () => void): void
  register(
    options: { name: string; id: string; order?: number },
    component: (props: SlotProps) => ReactElement | null
  ): () => void
}

export interface ClientContext {
  slots: SlotsApi
  locale: LocaleApi
  effect(callback: () => (() => void) | void, label?: string): void
}
