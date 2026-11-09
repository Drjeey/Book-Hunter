# Book Hunter shelf image upload: first scanner step

The first scanner step stores one photo. It does not try to read book spines yet.

```text
Phone or computer image
  → POST /api/v1/shelf-images (raw image bytes)
  → Node validates size and file type
  → backend/.local/shelf-images/<random ID>.<extension>
  → JSON response with the image ID and preview URL
```

**Why bytes instead of JSON?** JSON represents text and structured values. A photo is already a sequence of bytes, so the browser can send the selected `File` directly as the request body with its MIME type in `Content-Type`.

The API accepts JPEG, PNG, or WebP up to 8 MB. It checks the file's opening bytes against that declared type. The name on your device is not used on the server; a random ID becomes the stored filename. `GET /api/v1/shelf-images/:id` returns the bytes for a later preview or OCR step.

For a local PowerShell check with the backend running, replace the path below with your own photo:

```powershell
$photo = "C:\path\to\shelf.jpg"
$result = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/shelf-images" -Method Post -ContentType "image/jpeg" -InFile $photo
$result.image
```

The response has the form `{ "image": { "id": "...", "contentType": "image/jpeg", "size": 12345, "url": "/api/v1/shelf-images/..." } }`. The ID is what a later OCR request will refer to. To see the image, open `http://127.0.0.1:8000` plus the returned `url`.

The files live only on the computer running the backend. They are ignored by Git and are not saved in PostgreSQL or Netlify. File signature checks do not fully decode an image; a later OCR step must still handle an unreadable file. The API is private only because it listens on the local loopback address. It needs authentication and durable hosted storage before public deployment.
