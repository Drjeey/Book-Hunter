import { useEffect, useState, type FormEvent } from 'react'
import { loadReaderProfile, saveReaderProfile, type ReaderProfile } from './profileStorage'
import TasteProfile from './TasteProfile'
import { publicSite } from './deployment'

const maxAvatarBytes = 2 * 1024 * 1024
const allowedAvatarTypes = ['image/png', 'image/jpeg']

function initialsFor(name: string) {
  return name.trim().charAt(0).toLocaleUpperCase() || '?'
}

function Avatar({ name, imageUrl }: { name: string; imageUrl: string | null }) {
  return (
    <div className="profile-avatar" aria-label={imageUrl ? 'Profile image preview' : 'Profile initials preview'}>
      {imageUrl ? <img src={imageUrl} alt="" /> : <span aria-hidden="true">{initialsFor(name)}</span>}
    </div>
  )
}

export default function ProfilePage() {
  const [savedProfile, setSavedProfile] = useState<ReaderProfile>({ displayName: '', avatar: null })
  const [draftProfile, setDraftProfile] = useState<ReaderProfile>({ displayName: '', avatar: null })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [avatarError, setAvatarError] = useState('')
  const [nameTouched, setNameTouched] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const nameIsInvalid = nameTouched && !draftProfile.displayName.trim()
  const isDirty = draftProfile.displayName !== savedProfile.displayName || draftProfile.avatar !== savedProfile.avatar

  useEffect(() => {
    let active = true

    loadReaderProfile()
      .then((profile) => {
        if (!active) return
        setSavedProfile(profile)
        setDraftProfile(profile)
      })
      .catch(() => {
        if (active) setError('Your profile could not be loaded from this browser. Please reload and try again.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!draftProfile.avatar) {
      setAvatarUrl(null)
      return
    }

    const url = URL.createObjectURL(draftProfile.avatar)
    setAvatarUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [draftProfile.avatar])

  function updateName(value: string) {
    setDraftProfile((current) => ({ ...current, displayName: value }))
    setNameTouched(true)
    setError('')
    setMessage('')
  }

  function chooseAvatar(file: File | undefined) {
    setAvatarError('')
    setMessage('')
    if (!file) return
    if (!allowedAvatarTypes.includes(file.type)) {
      setAvatarError('Choose a PNG or JPG image.')
      return
    }
    if (file.size > maxAvatarBytes) {
      setAvatarError('Choose an image smaller than 2 MB.')
      return
    }

    setDraftProfile((current) => ({ ...current, avatar: file }))
  }

  function cancelChanges() {
    setDraftProfile(savedProfile)
    setNameTouched(false)
    setAvatarError('')
    setError('')
    setMessage('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNameTouched(true)
    setMessage('')
    setError('')
    if (!draftProfile.displayName.trim()) return

    setSaving(true)
    try {
      const profile = { ...draftProfile, displayName: draftProfile.displayName.trim() }
      await saveReaderProfile(profile)
      setSavedProfile(profile)
      setDraftProfile(profile)
      setNameTouched(false)
      setMessage('Your profile was saved on this device.')
    } catch {
      setError('Your profile could not be saved. Check your browser storage and try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="main-content profile-page">
      <div className="profile-intro">
        <p className="eyebrow"><span className="profile-eyebrow-mark" aria-hidden="true" />Private archive · Reader settings</p>
        <h1>Reader Profile</h1>
        <p className="page-description">Add a name and image to make this reading space yours.</p>
      </div>

      <section className="profile-card" aria-label="Reader profile details">
        {loading ? (
          <p className="profile-status" role="status">Loading your profile…</p>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <fieldset className="avatar-fieldset" disabled={saving}>
              <legend>Profile image <span className="optional-label">Optional</span></legend>
              <p className="field-help">Choose a small PNG or JPG image, or use your initials.</p>
              <div className="avatar-row">
                <Avatar name={draftProfile.displayName} imageUrl={avatarUrl} />
                <div className="avatar-controls">
                  <label className="button button-secondary" htmlFor="profile-avatar">Choose image</label>
                  <input
                    className="visually-hidden"
                    id="profile-avatar"
                    type="file"
                    accept="image/png,image/jpeg"
                    aria-describedby={avatarError ? 'avatar-guidance avatar-error' : 'avatar-guidance'}
                    onChange={(event) => {
                      chooseAvatar(event.currentTarget.files?.[0])
                      event.currentTarget.value = ''
                    }}
                  />
                  <button
                    className="button button-text"
                    type="button"
                    disabled={!draftProfile.avatar}
                    onClick={() => {
                      setDraftProfile((current) => ({ ...current, avatar: null }))
                      setAvatarError('')
                      setMessage('')
                    }}
                  >
                    Remove image
                  </button>
                  <p className="field-help avatar-guidance" id="avatar-guidance">PNG or JPG, up to 2 MB. Stored in this browser on this device.</p>
                  {avatarError && <p className="field-error" id="avatar-error" role="alert">{avatarError}</p>}
                </div>
              </div>
            </fieldset>

            <div className="profile-divider" />

            <div className="profile-name-field">
              <label htmlFor="display-name">Display name <span aria-hidden="true">*</span></label>
              <p className="field-help" id="display-name-help">This name appears in your Book Hunter space.</p>
              <input
                id="display-name"
                name="displayName"
                type="text"
                autoComplete="nickname"
                maxLength={60}
                value={draftProfile.displayName}
                placeholder="Enter a display name"
                required
                aria-invalid={nameIsInvalid}
                aria-describedby={nameIsInvalid ? 'display-name-help display-name-error' : 'display-name-help'}
                disabled={saving}
                onChange={(event) => updateName(event.currentTarget.value)}
                onBlur={() => setNameTouched(true)}
              />
              {nameIsInvalid && <p className="field-error" id="display-name-error" role="alert">Enter a display name to continue.</p>}
            </div>

            <div className="profile-actions">
              <button className="button button-text" type="button" disabled={!isDirty || saving} onClick={cancelChanges}>Cancel</button>
              <button className="button button-primary" type="submit" disabled={!isDirty || saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        )}
      </section>

      {error && <p className="profile-alert" role="alert">{error}</p>}
      {message && <p className="profile-success" role="status">{message}</p>}

      <aside className="profile-privacy" aria-label="Profile storage information">
        <span className="privacy-lock" aria-hidden="true">♡</span>
        <div>
          <h2>Name and image on this device</h2>
          <p>Your display name and image are saved in this browser. They are not sent to an account or public profile.</p>
        </div>
      </aside>

      {publicSite
        ? <section className="public-feature-note" aria-label="Reading taste availability">Reading taste preferences require the private backend and are not hosted online yet.</section>
        : <TasteProfile />}
    </main>
  )
}
