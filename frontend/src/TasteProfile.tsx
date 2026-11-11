import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { publicSite } from './deployment'
import { loadTasteProfile, saveTasteProfile, type TasteOptions, type TasteProfileValue } from './tasteClient'

type SelectionField = 'favoriteGenres' | 'favoriteThemes' | 'avoidTraits'

const paceLabels = { any: 'No preference', slow: 'Slow and reflective', balanced: 'Balanced', fast: 'Fast-moving' }
const writingLabels = { any: 'No preference', direct: 'Direct and clear', lyrical: 'Lyrical and descriptive' }

function ChoiceGroup({ title, hint, choices, selected, onToggle }: {
  title: string
  hint: string
  choices: string[]
  selected: string[]
  onToggle: (choice: string) => void
}) {
  return (
    <fieldset className="taste-choice-group">
      <legend>{title}</legend>
      <p className="field-help">{hint} Select up to five.</p>
      <div className="taste-choices">
        {choices.map((choice) => {
          const checked = selected.includes(choice)
          return (
            <label className={`taste-choice ${checked ? 'taste-choice-selected' : ''}`} key={choice}>
              <input type="checkbox" checked={checked} disabled={!checked && selected.length >= 5} onChange={() => onToggle(choice)} />
              <span>{choice}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

export default function TasteProfile() {
  const [saved, setSaved] = useState<TasteProfileValue | null>(null)
  const [draft, setDraft] = useState<TasteProfileValue | null>(null)
  const [options, setOptions] = useState<TasteOptions | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const payload = await loadTasteProfile()
      setSaved(payload.profile)
      setDraft(payload.profile)
      setOptions(payload.options)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Your reading preferences could not be loaded.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const isDirty = Boolean(saved && draft && JSON.stringify(saved) !== JSON.stringify(draft))

  function toggle(field: SelectionField, choice: string) {
    setDraft((current) => {
      if (!current) return current
      const values = current[field]
      return {
        ...current,
        [field]: values.includes(choice) ? values.filter((value) => value !== choice) : [...values, choice],
      }
    })
    setMessage('')
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft || !isDirty) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const payload = await saveTasteProfile(draft)
      setSaved(payload.profile)
      setDraft(payload.profile)
      setMessage('Your reading preferences were saved.')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Your reading preferences could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="taste-profile-section" aria-labelledby="taste-heading">
      <div className="taste-heading">
        <p className="eyebrow"><span className="profile-eyebrow-mark" aria-hidden="true" />Your reading preferences</p>
        <h2 id="taste-heading">Reading taste</h2>
        <p className="page-description">Choose what draws you to a book. You can change these choices any time.</p>
      </div>

      {loading && <div className="taste-state" role="status">Loading your reading preferences…</div>}
      {!loading && (!draft || !options) && (
        <div className="taste-state taste-state-error" role="alert">
          <p>{error || 'Your reading preferences could not be loaded.'}</p>
          <button className="button button-secondary" type="button" onClick={() => void load()}>Try again</button>
        </div>
      )}
      {!loading && draft && options && (
        <form className="taste-form" onSubmit={(event) => void save(event)}>
          <fieldset disabled={saving} className="taste-form-fields">
            <ChoiceGroup
              title="Genres you enjoy"
              hint="Choose the shelves you often browse."
              choices={options.genres}
              selected={draft.favoriteGenres}
              onToggle={(choice) => toggle('favoriteGenres', choice)}
            />
            <ChoiceGroup
              title="Themes that interest you"
              hint="Pick ideas that keep you reading."
              choices={options.themes}
              selected={draft.favoriteThemes}
              onToggle={(choice) => toggle('favoriteThemes', choice)}
            />
            <div className="taste-select-grid">
              <label>Preferred pace
                <select value={draft.preferredPace} onChange={(event) => { setDraft({ ...draft, preferredPace: event.target.value as TasteProfileValue['preferredPace'] }); setMessage('') }}>
                  {options.paces.map((pace) => <option value={pace} key={pace}>{paceLabels[pace]}</option>)}
                </select>
              </label>
              <label>Writing style
                <select value={draft.writingStyle} onChange={(event) => { setDraft({ ...draft, writingStyle: event.target.value as TasteProfileValue['writingStyle'] }); setMessage('') }}>
                  {options.writingStyles.map((style) => <option value={style} key={style}>{writingLabels[style]}</option>)}
                </select>
              </label>
              <label>Interest in plot twists
                <select value={draft.twistInterest ?? ''} onChange={(event) => { setDraft({ ...draft, twistInterest: event.target.value ? Number(event.target.value) : null }); setMessage('') }}>
                  <option value="">No preference</option>
                  {[1, 2, 3, 4, 5].map((value) => <option value={value} key={value}>{value} of 5</option>)}
                </select>
              </label>
              <label>Interest in psychological depth
                <select value={draft.psychologicalDepth ?? ''} onChange={(event) => { setDraft({ ...draft, psychologicalDepth: event.target.value ? Number(event.target.value) : null }); setMessage('') }}>
                  <option value="">No preference</option>
                  {[1, 2, 3, 4, 5].map((value) => <option value={value} key={value}>{value} of 5</option>)}
                </select>
              </label>
            </div>
            <p className="field-help">For the 1–5 choices, 1 means little interest and 5 means strong interest.</p>
            <ChoiceGroup
              title="Traits you prefer to avoid"
              hint="These can help shape later recommendations."
              choices={options.avoidTraits}
              selected={draft.avoidTraits}
              onToggle={(choice) => toggle('avoidTraits', choice)}
            />
          </fieldset>

          {error && <p className="profile-alert" role="alert">{error}</p>}
          {message && <p className="profile-success" role="status">{message}</p>}
          <div className="taste-actions">
            <button className="button button-text" type="button" disabled={!isDirty || saving} onClick={() => { setDraft(saved); setError(''); setMessage('') }}>Cancel</button>
            <button className="button button-primary" type="submit" disabled={!isDirty || saving}>{saving ? 'Saving…' : 'Save preferences'}</button>
          </div>
          <p className="taste-storage-note">{publicSite
            ? 'These preferences are saved in this browser on this device. They are not synced or backed up online.'
            : "These preferences are saved in Book Hunter's database. This screen does not publish them."}</p>
        </form>
      )}
    </section>
  )
}
