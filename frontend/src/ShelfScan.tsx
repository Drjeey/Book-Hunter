import { useEffect, useState, type ChangeEvent, type DragEvent } from 'react'

const MAX_IMAGE_BYTES = 8 * 1024 * 1024
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

type UploadPhase = 'ready' | 'selected' | 'uploading' | 'error' | 'success'
type StoredImage = { id: string; contentType: string; size: number; url: string }

function formatSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function ImagePicker({ onSelect, disabled, camera = false, label }: {
  onSelect: (file: File) => void
  disabled: boolean
  camera?: boolean
  label: string
}) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.currentTarget.files?.[0]
    if (selected) onSelect(selected)
    event.currentTarget.value = ''
  }

  return (
    <label className={`button ${camera ? 'button-primary' : 'button-secondary'} scan-picker ${disabled ? 'scan-picker-disabled' : ''}`}>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture={camera ? 'environment' : undefined}
        onChange={handleChange}
        disabled={disabled}
      />
      <span aria-hidden="true">{camera ? '◉' : '▣'}</span>
      {label}
    </label>
  )
}

export default function ShelfScan() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [stored, setStored] = useState<StoredImage | null>(null)
  const [phase, setPhase] = useState<UploadPhase>('ready')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!file) {
      setPreviewUrl('')
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  function selectFile(selected: File) {
    if (!IMAGE_TYPES.has(selected.type)) {
      setError('Choose a JPEG, PNG, or WebP image. Some phone photos use HEIC, which is not supported yet.')
      setPhase('error')
      return
    }
    if (selected.size === 0 || selected.size > MAX_IMAGE_BYTES) {
      setError('Choose an image larger than 0 bytes and smaller than 8 MB.')
      setPhase('error')
      return
    }
    setFile(selected)
    setStored(null)
    setError('')
    setPhase('selected')
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    if (phase === 'uploading') return
    const selected = event.dataTransfer.files[0]
    if (selected) selectFile(selected)
  }

  function reset() {
    setFile(null)
    setStored(null)
    setError('')
    setPhase('ready')
  }

  async function upload() {
    if (!file || phase === 'uploading') return
    setError('')
    setPhase('uploading')
    try {
      const response = await fetch('/api/v1/shelf-images', {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      const isJson = response.headers.get('content-type')?.includes('application/json')
      const payload = isJson ? await response.json() as { image?: StoredImage; error?: string } : null
      if (!response.ok || !payload?.image) {
        throw new Error(payload?.error || 'The upload service is unavailable. Check that the local Book Hunt backend is running, then retry.')
      }
      setStored(payload.image)
      setPhase('success')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The image could not be uploaded. Please try again.')
      setPhase('error')
    }
  }

  const uploading = phase === 'uploading'

  return (
    <main id="scan" className="main-content scan-page">
      <div className="page-intro scan-intro">
        <p className="eyebrow">Shelf photographs · Private local storage</p>
        <h1>Shelf Scan</h1>
        <p className="page-description">Photograph book spines clearly. For now, Book Hunt stores your image for a later identification step.</p>
        <p className="scan-storage-note">Images are stored on the computer running the local Book Hunt backend. Online uploads are not set up yet.</p>
      </div>

      <div className="scan-layout">
        <section className="scan-card" aria-labelledby="scan-upload-heading" aria-busy={uploading}>
          {phase === 'success' && stored ? (
            <div className="scan-success" role="status">
              <span className="scan-icon" aria-hidden="true">✓</span>
              <h2 id="scan-upload-heading">Image stored</h2>
              <p>Your shelf photo is ready for a future book identification step. No books were added to My Library.</p>
              <img src={stored.url} alt="Your stored shelf photograph" className="scan-preview-image" />
              <dl className="scan-details">
                <div><dt>Image ID</dt><dd className="scan-id">{stored.id}</dd></div>
                <div><dt>File type</dt><dd>{stored.contentType.replace('image/', '').toUpperCase()}</dd></div>
                <div><dt>Size</dt><dd>{formatSize(stored.size)}</dd></div>
              </dl>
              <button className="button button-primary scan-main-action" type="button" onClick={reset}>Upload another image</button>
            </div>
          ) : file ? (
            <div className="scan-selected">
              <span className="scan-icon" aria-hidden="true">▣</span>
              <h2 id="scan-upload-heading">Selected photograph</h2>
              {previewUrl && <img src={previewUrl} alt="Preview of your selected shelf photograph" className="scan-preview-image" />}
              <dl className="scan-details">
                <div><dt>Filename</dt><dd>{file.name}</dd></div>
                <div><dt>File size</dt><dd>{formatSize(file.size)}</dd></div>
              </dl>
              {uploading && <p className="scan-progress" role="status">Uploading your image… Please keep Book Hunt open.</p>}
              {error && <p className="scan-error" role="alert">{error}</p>}
              <div className="scan-actions">
                <ImagePicker label="Replace" onSelect={selectFile} disabled={uploading} />
                <button className="button button-secondary" type="button" onClick={reset} disabled={uploading}>Remove</button>
              </div>
              <button className="button button-primary scan-main-action" type="button" onClick={upload} disabled={uploading}>
                {uploading ? 'Uploading…' : phase === 'error' ? 'Retry upload' : 'Upload image'}
              </button>
            </div>
          ) : (
            <div className="scan-ready" onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
              <span className="scan-icon" aria-hidden="true">▣</span>
              <h2 id="scan-upload-heading">Upload a shelf photograph</h2>
              <p>Choose a photo or drag it here. On a phone, you can take a new photo.</p>
              {error && <p className="scan-error" role="alert">{error}</p>}
              <div className="scan-actions">
                <ImagePicker label="Take photo" onSelect={selectFile} disabled={false} camera />
                <ImagePicker label="Choose file" onSelect={selectFile} disabled={false} />
              </div>
              <p className="scan-file-help">JPEG, PNG, or WebP · Maximum 8 MB</p>
            </div>
          )}
        </section>

        <aside className="scan-guidance" aria-label="Photo guidance">
          <section className="scan-tip-card">
            <p className="scan-card-label">For a clear photo</p>
            <h2>Capture readable spines</h2>
            <ul>
              <li>Hold the camera straight in front of the shelf.</li>
              <li>Avoid glare across titles and author names.</li>
              <li>Get close enough for the spine text to be legible.</li>
            </ul>
          </section>
          <section className="scan-tip-card">
            <p className="scan-card-label">What happens next</p>
            <h2>Stored for later</h2>
            <p>This step saves the image only. Reading spine text and finding matching books will come later.</p>
          </section>
        </aside>
      </div>
    </main>
  )
}
