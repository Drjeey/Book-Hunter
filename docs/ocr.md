# OCR: reading raw text from a shelf image

**OCR** means optical character recognition. It turns visible letters in an image into editable text. In Book Hunter, OCR runs in the local Node backend after the image has been uploaded. It is not yet a book identifier.

```text
Stored image ID
  → POST /api/v1/shelf-images/:id/ocr
  → local Tesseract.js English worker
  → { imageId, text }
  → Shelf Scan shows the raw text for review
```

The route takes no JSON body: the image ID in the URL refers to the photo already stored by the upload route. It returns HTTP 404 for an unknown ID, HTTP 503 if recognition fails, or HTTP 200 with `text: ""` if the engine finds no readable words. The result is not saved in PostgreSQL and does not alter My Library.

For a local PowerShell check after uploading an image, use the returned ID:

```powershell
$id = "YOUR_IMAGE_ID"
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/shelf-images/$id/ocr" -Method Post
```

Tesseract.js is a Node package that runs a WebAssembly OCR engine. Its English language file may be downloaded on first use, then cached in `backend/.local/ocr-cache/`; the photograph itself stays on the local backend. Reusing one worker avoids repeating setup for every photograph. See the official [Tesseract.js usage](https://github.com/naptha/tesseract.js/#readme) and [worker API](https://github.com/naptha/tesseract.js/blob/master/docs/api.md).

OCR output can contain mistakes, especially for narrow, curved, reflective, or rotated book spines. An empty result means no text was recognized, not that the shelf is empty. The Shelf Scan page now lets the owner start OCR after upload, review and copy raw text, retry errors or empty results, and re-run recognition. This does not identify titles or authors, and nothing is added to My Library.
