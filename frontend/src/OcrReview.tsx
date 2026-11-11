import { useEffect, useRef, useState } from 'react'

type OcrPhase = 'idle' | 'reading' | 'failed' | 'empty' | 'succeeded'

export default function OcrReview({ imageId }: { imageId: string }) {
  const [phase, setPhase] = useState<OcrPhase>('idle')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [copyMessage, setCopyMessage] = useState('')
  const request = useRef<AbortController | null>(null)

  useEffect(() => () => request.current?.abort(), [])

  async function readText() {
    if (phase === 'reading') return
    const controller = new AbortController()
    request.current = controller
    setPhase('reading')
    setError('')
    setCopyMessage('')
    try {
      const response = await fetch(`/api/v1/shelf-images/${encodeURIComponent(imageId)}/ocr`, {
        method: 'POST',
        signal: controller.signal,
      })
      const isJson = response.headers.get('content-type')?.includes('application/json')
      const payload = isJson ? await response.json() as { imageId?: string; text?: string; error?: string } : null
      if (!response.ok || typeof payload?.text !== 'string' || payload.imageId !== imageId) {
        throw new Error(payload?.error || 'Text could not be read. Check that the local Book Hunter backend is running, then retry.')
      }
      setText(payload.text)
      setPhase(payload.text.trim() ? 'succeeded' : 'empty')
    } catch (caught) {
      if (controller.signal.aborted) return
      setError(caught instanceof Error ? caught.message : 'Text could not be read. Please retry.')
      setPhase('failed')
    } finally {
      if (request.current === controller) request.current = null
    }
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text)
      setCopyMessage('Raw text copied.')
    } catch {
      setCopyMessage('Could not copy automatically. Select the text below to copy it.')
    }
  }

  return (
    <section className="ocr-review" aria-labelledby="ocr-review-heading" aria-busy={phase === 'reading'}>
      <p className="scan-card-label">Local character reading</p>
      <h3 id="ocr-review-heading">OCR Text Review</h3>
      <p className="ocr-intro">Read the visible letters in your stored photo, then review the raw result.</p>

      {phase === 'idle' && <button className="button button-primary ocr-primary-action" type="button" onClick={readText}>Read text from image</button>}

      {phase === 'reading' && (
        <div className="ocr-reading" role="status">
          <span className="ocr-progress-track" aria-hidden="true"><span /></span>
          <p>Reading text from your image… The English text reader may take a moment to start the first time.</p>
        </div>
      )}

      {phase === 'failed' && (
        <div className="ocr-feedback ocr-feedback-error">
          <p role="alert">{error}</p>
          <button className="button button-primary" type="button" onClick={readText}>Retry reading</button>
        </div>
      )}

      {phase === 'empty' && (
        <div className="ocr-feedback">
          <p role="status"><strong>No legible text detected.</strong> Glare, small lettering, or rotated spines may make reading difficult. Try again or upload a clearer photo.</p>
          <button className="button button-primary" type="button" onClick={readText}>Retry reading</button>
        </div>
      )}

      {phase === 'succeeded' && (
        <div className="ocr-result">
          <p className="ocr-result-label" role="status">Raw text extracted</p>
          <pre className="ocr-raw-text" tabIndex={0} aria-label="Raw text extracted from your shelf image">{text}</pre>
          <div className="ocr-actions">
            <button className="button button-secondary" type="button" onClick={copyText}>Copy raw text</button>
            <button className="button button-secondary" type="button" onClick={readText}>Re-run OCR</button>
          </div>
          {copyMessage && <p className="ocr-copy-message" role="status">{copyMessage}</p>}
        </div>
      )}

      <p className="ocr-caution">OCR may misread narrow or rotated book spines. Review the text before using it. Book identification and My Library updates come later.</p>
    </section>
  )
}
