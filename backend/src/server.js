import { createServer } from "node:http";
import { searchBooks, SearchProviderError } from "./books/search.js";
import {
  addToLibrary,
  LibraryRequestError,
  listLibrary,
  removeFromLibrary,
  updateLibraryReflection,
  updateLibraryStatus,
} from "./books/library.js";
import { pool } from "./db/pool.js";
import { getShelfImage, readImageBody, saveShelfImage, ShelfImageError } from "./shelves/images.js";
import { closeOcrWorker, recognizeShelfImage } from "./shelves/ocr.js";
import { getTasteProfile, saveTasteProfile, TASTE_OPTIONS, TasteProfileError } from "./taste/profile.js";

const port = Number(process.env.PORT ?? 8000);

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

async function readJsonBody(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 32_000) throw new LibraryRequestError("The request is too large.", 413);
  }
  try {
    return JSON.parse(body);
  } catch {
    throw new LibraryRequestError("Send valid JSON in the request body.");
  }
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");

  if (request.method === "GET" && requestUrl.pathname === "/api/v1/health") {
    sendJson(response, 200, { status: "ok", service: "book-hunt-api" });
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/v1/books") {
    try {
      const results = await searchBooks({
        query: requestUrl.searchParams.get("query"),
        page: requestUrl.searchParams.get("page"),
      });
      sendJson(response, 200, results);
    } catch (error) {
      if (error instanceof SearchProviderError) {
        sendJson(response, error.status, { error: error.message });
        return;
      }

      console.error("Book search failed:", error);
      sendJson(response, 500, { error: "Book search could not be completed." });
    }
    return;
  }

  if (requestUrl.pathname === "/api/v1/shelf-images" && request.method === "POST") {
    try {
      const image = await saveShelfImage(await readImageBody(request));
      sendJson(response, 201, { image });
    } catch (error) {
      if (error instanceof ShelfImageError) {
        sendJson(response, error.status, { error: error.message });
        return;
      }
      console.error("Shelf image could not be saved:", error);
      sendJson(response, 503, { error: "The image could not be saved. Please try again." });
    }
    return;
  }

  const shelfImageMatch = requestUrl.pathname.match(/^\/api\/v1\/shelf-images\/([^/]+)$/);
  if (shelfImageMatch && request.method === "GET") {
    try {
      const image = await getShelfImage(shelfImageMatch[1]);
      response.writeHead(200, {
        "Content-Type": image.contentType,
        "Content-Length": image.data.length,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      });
      response.end(image.data);
    } catch (error) {
      if (error instanceof ShelfImageError) {
        sendJson(response, error.status, { error: error.message });
        return;
      }
      console.error("Shelf image could not be loaded:", error);
      sendJson(response, 503, { error: "The image could not be loaded. Please try again." });
    }
    return;
  }

  const shelfOcrMatch = requestUrl.pathname.match(/^\/api\/v1\/shelf-images\/([^/]+)\/ocr$/);
  if (shelfOcrMatch && request.method === "POST") {
    try {
      const result = await recognizeShelfImage(shelfOcrMatch[1]);
      sendJson(response, 200, result);
    } catch (error) {
      if (error instanceof ShelfImageError) {
        sendJson(response, error.status, { error: error.message });
        return;
      }
      console.error("Shelf image OCR failed:", error);
      sendJson(response, 503, { error: "Text could not be read from this image. Please try again." });
    }
    return;
  }

  if (requestUrl.pathname === "/api/v1/taste-profile" && ["GET", "PUT"].includes(request.method)) {
    try {
      const profile = request.method === "GET"
        ? await getTasteProfile()
        : await saveTasteProfile(await readJsonBody(request));
      sendJson(response, 200, { profile, options: TASTE_OPTIONS });
    } catch (error) {
      if (error instanceof TasteProfileError) {
        sendJson(response, error.status, { error: error.message });
        return;
      }
      console.error("Taste profile could not be loaded or saved:", error);
      sendJson(response, 503, { error: "Reading preferences are unavailable. Check the database and try again." });
    }
    return;
  }

  if (requestUrl.pathname === "/api/v1/library" && request.method === "GET") {
    try {
      const books = await listLibrary({ status: requestUrl.searchParams.get("status") });
      sendJson(response, 200, { books });
    } catch (error) {
      if (error instanceof LibraryRequestError) {
        sendJson(response, error.status, { error: error.message });
        return;
      }
      console.error("Library could not be loaded:", error);
      sendJson(response, 503, { error: "Your library could not be loaded. Check that PostgreSQL is running and try again." });
    }
    return;
  }

  if (requestUrl.pathname === "/api/v1/library" && request.method === "POST") {
    try {
      const result = await addToLibrary(await readJsonBody(request));
      sendJson(response, 201, result);
    } catch (error) {
      if (error instanceof LibraryRequestError) {
        sendJson(response, error.status, { error: error.message });
        return;
      }
      console.error("Book could not be added to the library:", error);
      sendJson(response, 503, { error: "This book could not be saved. Check that the database is available and try again." });
    }
    return;
  }

  const reflectionMatch = requestUrl.pathname.match(/^\/api\/v1\/library\/([^/]+)\/reflection$/);
  if (reflectionMatch && request.method === "PATCH") {
    try {
      const body = await readJsonBody(request);
      const result = await updateLibraryReflection(decodeURIComponent(reflectionMatch[1]), body);
      sendJson(response, 200, result);
    } catch (error) {
      if (error instanceof LibraryRequestError) {
        sendJson(response, error.status, { error: error.message });
        return;
      }
      console.error("Rating and note could not be updated:", error);
      sendJson(response, 503, { error: "Your rating and note could not be saved. Please try again." });
    }
    return;
  }

  const libraryItemMatch = requestUrl.pathname.match(/^\/api\/v1\/library\/([^/]+)$/);
  if (libraryItemMatch && request.method === "PATCH") {
    try {
      const body = await readJsonBody(request);
      const result = await updateLibraryStatus(decodeURIComponent(libraryItemMatch[1]), body?.status);
      sendJson(response, 200, result);
    } catch (error) {
      if (error instanceof LibraryRequestError) {
        sendJson(response, error.status, { error: error.message });
        return;
      }
      console.error("Library status could not be updated:", error);
      sendJson(response, 503, { error: "The reading status could not be changed. Please try again." });
    }
    return;
  }

  if (libraryItemMatch && request.method === "DELETE") {
    try {
      await removeFromLibrary(decodeURIComponent(libraryItemMatch[1]));
      sendJson(response, 200, { removed: true });
    } catch (error) {
      if (error instanceof LibraryRequestError) {
        sendJson(response, error.status, { error: error.message });
        return;
      }
      console.error("Book could not be removed from the library:", error);
      sendJson(response, 503, { error: "The book could not be removed. Please try again." });
    }
    return;
  }

  sendJson(response, 404, { error: "Route not found" });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Book Hunter API listening at http://127.0.0.1:${port}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    server.close(() => Promise.all([pool.end(), closeOcrWorker()]).finally(() => process.exit(0)));
  });
}
