import { getOwnerId, pool } from "../db/pool.js";

export const LIBRARY_STATUSES = ["want_to_read", "reading", "read", "did_not_finish"];

export class LibraryRequestError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "LibraryRequestError";
    this.status = status;
  }
}

function validateBook(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new LibraryRequestError("Send book details to save this title.");
  }
  const id = typeof input.id === "string" ? input.id.trim() : "";
  const title = typeof input.title === "string" ? input.title.trim() : "";
  if (!/^[A-Za-z0-9_-]{1,120}$/.test(id)) {
    throw new LibraryRequestError("This book has an invalid catalog ID.");
  }
  if (title.length < 1 || title.length > 500) {
    throw new LibraryRequestError("A book title is required and must be 500 characters or fewer.");
  }

  const authors = Array.isArray(input.authors)
    ? input.authors.filter((author) => typeof author === "string").map((author) => author.trim()).filter(Boolean).slice(0, 20)
    : [];
  const year = Number.isInteger(input.firstPublishedYear) && input.firstPublishedYear >= 1 && input.firstPublishedYear <= 3000
    ? input.firstPublishedYear
    : null;
  const isbn = typeof input.isbn === "string" && /^[0-9Xx-]{10,17}$/.test(input.isbn.trim())
    ? input.isbn.trim().replaceAll("-", "")
    : null;
  const coverUrl = typeof input.coverUrl === "string"
    && /^https:\/\/covers\.openlibrary\.org\/b\/id\/\d+-[A-Z]\.jpg(?:\?default=false)?$/i.test(input.coverUrl)
    ? input.coverUrl
    : null;

  return {
    id,
    title,
    authorNames: authors.join(", "),
    year,
    isbn10: isbn?.length === 10 ? isbn : null,
    isbn13: isbn?.length === 13 ? isbn : null,
    coverUrl,
  };
}

function mapLibraryRow(row) {
  return {
    id: String(row.user_book_id),
    bookId: String(row.book_id),
    source: row.catalog_source,
    sourceBookId: row.source_book_id,
    title: row.title,
    authors: row.author_names ? row.author_names.split(", ").filter(Boolean) : [],
    firstPublishedYear: row.publication_year,
    coverUrl: row.cover_url,
    isbn: row.isbn_13 ?? row.isbn_10,
    status: row.status,
    rating: row.rating ?? null,
    note: row.personal_note ?? "",
    addedAt: row.added_at,
  };
}

export async function listLibrary({ status } = {}) {
  if (status && status !== "all" && !LIBRARY_STATUSES.includes(status)) {
    throw new LibraryRequestError("Choose a valid reading status.");
  }
  const ownerId = await getOwnerId();
  const result = await pool.query(`
    SELECT ub.id AS user_book_id, b.id AS book_id, b.catalog_source, b.source_book_id,
      b.title, b.author_names, b.publication_year, b.cover_url, b.isbn_10, b.isbn_13,
      ub.status, ub.rating, ub.personal_note, ub.added_at
    FROM user_books ub
    JOIN books b ON b.id = ub.book_id
    WHERE ub.user_id = $1 AND ($2::text IS NULL OR ub.status = $2)
    ORDER BY ub.added_at DESC, ub.id DESC
  `, [ownerId, status && status !== "all" ? status : null]);
  return result.rows.map(mapLibraryRow);
}

export async function addToLibrary(input) {
  const book = validateBook(input);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const ownerId = await getOwnerId(client);
    const catalogResult = await client.query(`
      INSERT INTO books (catalog_source, source_book_id, title, author_names, isbn_10, isbn_13, cover_url, publication_year)
      VALUES ('openlibrary', $1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (catalog_source, source_book_id) DO UPDATE SET
        title = EXCLUDED.title,
        author_names = EXCLUDED.author_names,
        isbn_10 = COALESCE(EXCLUDED.isbn_10, books.isbn_10),
        isbn_13 = COALESCE(EXCLUDED.isbn_13, books.isbn_13),
        cover_url = COALESCE(EXCLUDED.cover_url, books.cover_url),
        publication_year = COALESCE(EXCLUDED.publication_year, books.publication_year)
      RETURNING id
    `, [book.id, book.title, book.authorNames, book.isbn10, book.isbn13, book.coverUrl, book.year]);
    const linkResult = await client.query(`
      INSERT INTO user_books (user_id, book_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, book_id) DO NOTHING
      RETURNING id
    `, [ownerId, catalogResult.rows[0].id]);
    if (linkResult.rowCount === 0) {
      await client.query("ROLLBACK");
      throw new LibraryRequestError("This book is already in your library.", 409);
    }
    await client.query("COMMIT");
    return { id: String(linkResult.rows[0].id), status: "want_to_read" };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

export async function updateLibraryStatus(id, status) {
  if (!/^\d{1,18}$/.test(id) || !LIBRARY_STATUSES.includes(status)) {
    throw new LibraryRequestError("Choose a valid book and reading status.");
  }
  const ownerId = await getOwnerId();
  const result = await pool.query(`
    UPDATE user_books SET status = $1
    WHERE id = $2 AND user_id = $3
    RETURNING id, status
  `, [status, id, ownerId]);
  if (result.rowCount === 0) throw new LibraryRequestError("That book was not found in your library.", 404);
  return { id: String(result.rows[0].id), status: result.rows[0].status };
}

export async function updateLibraryReflection(id, input) {
  if (!/^\d{1,18}$/.test(id)) {
    throw new LibraryRequestError("Choose a valid book to rate or note.");
  }
  if (!input || typeof input !== "object" || Array.isArray(input)
    || !Object.hasOwn(input, "rating") || !Object.hasOwn(input, "note")) {
    throw new LibraryRequestError("Send a rating and note. Either may be empty.");
  }
  const { rating, note } = input;
  if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
    throw new LibraryRequestError("Rating must be 1 to 5 stars, or empty.");
  }
  if (typeof note !== "string" || note.length > 2000) {
    throw new LibraryRequestError("Note must be text of 2000 characters or fewer.");
  }

  const ownerId = await getOwnerId();
  const result = await pool.query(`
    UPDATE user_books
    SET rating = $1, personal_note = $2
    WHERE id = $3 AND user_id = $4
    RETURNING rating, personal_note
  `, [rating, note.trim() || null, id, ownerId]);
  if (result.rowCount === 0) {
    throw new LibraryRequestError("That book was not found in your library.", 404);
  }
  return { rating: result.rows[0].rating, note: result.rows[0].personal_note ?? "" };
}

export async function removeFromLibrary(id) {
  if (!/^\d{1,18}$/.test(id)) throw new LibraryRequestError("Choose a valid book to remove.");
  const ownerId = await getOwnerId();
  const result = await pool.query("DELETE FROM user_books WHERE id = $1 AND user_id = $2 RETURNING id", [id, ownerId]);
  if (result.rowCount === 0) throw new LibraryRequestError("That book was not found in your library.", 404);
}
