import React, { useState } from 'react'
import { LIMITS, limitHit } from './model.ts'
import type { InputProblem } from './model.ts'
import type { PromptInput } from './types.ts'

interface EditorProps {
  value: PromptInput
  onSave: (value: PromptInput) => void
  onCancel: () => void
  t: (key: string) => string
}

/** `12 / 80`, turning red once the field is over its limit. */
function Counter({ value, max }: { value: number; max: number }) {
  return (
    <span className="pp-counter" data-over={value > max ? 'true' : 'false'}>
      {value} / {max}
    </span>
  )
}

export function Editor({ value, onSave, onCancel, t }: EditorProps) {
  const [title, setTitle] = useState(value.title)
  const [body, setBody] = useState(value.body)
  const [tags, setTags] = useState((value.tags ?? []).join(', '))
  const [problem, setProblem] = useState<InputProblem | null>(null)

  const parsedTags = [...new Set(tags.split(',').map((tag) => tag.trim()).filter(Boolean))]
  const message = (hit: InputProblem): string =>
    t(hit.key).replace('{max}', String(hit.limit ?? ''))

  return (
    <form
      className="pp-editor"
      onSubmit={(event) => {
        event.preventDefault()
        const input: PromptInput = { title, body, tags: parsedTags }
        const hit = limitHit(input)
        setProblem(hit)
        if (hit) return
        onSave(input)
      }}
    >
      <label className="pp-field">
        <span className="pp-field-head">
          <span>{t('titleLabel')}</span>
          <Counter value={title.length} max={LIMITS.title} />
        </span>
        <input
          value={title}
          maxLength={LIMITS.title}
          autoFocus
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>
      <label className="pp-field">
        <span className="pp-field-head">
          <span>{t('bodyLabel')}</span>
          <Counter value={body.length} max={LIMITS.body} />
        </span>
        <textarea
          value={body}
          maxLength={LIMITS.body}
          onChange={(event) => setBody(event.target.value)}
        />
      </label>
      <label className="pp-field">
        <span className="pp-field-head">
          <span>{t('tagsLabel')}</span>
          <Counter value={parsedTags.length} max={LIMITS.tags} />
        </span>
        <input
          value={tags}
          placeholder={t('tagsHint')}
          onChange={(event) => setTags(event.target.value)}
        />
      </label>
      {problem && (
        <p className="pp-field-error" role="alert">
          {message(problem)}
        </p>
      )}
      <footer className="pp-editor-footer">
        <button type="button" className="pp-button" onClick={onCancel}>
          {t('cancel')}
        </button>
        <button type="submit" className="pp-button pp-primary">
          {t('save')}
        </button>
      </footer>
    </form>
  )
}
