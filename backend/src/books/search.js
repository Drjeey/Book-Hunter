const OPEN_LIBRARY_SEARCH_URL = "https://openlibrary.org/search.json";
const RESULTS_PER_PAGE = 20;
const MAX_PAGE = 100;
const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_ENTRIES = 50;
const MIN_PROVIDER_INTERVAL_MS = 1000;
const PROVIDER_TIMEOUT_MS = 8000;

const searchCache = new Map();
const inFlightSearches = new Map();
let nextProviderRequest = Promise.resolve();
let lastProviderRequestAt = 0;

export class SearchProviderError extends Error {
  constructor(message, status = 503) {
    super(message);
    this.name = "SearchProviderError";
    this.status = status;
  }
}

function parsePage(value) {
  if (value === null || value === "") return 1;
  const page = Number(value);
  if (!Number.isInteger(page) || page < 1 || page > MAX_PAGE) {
    throw new SearchProviderError(`Page must be a whole number between 1 and ${MAX_PAGE}.`, 400);
  }
  return page;
}

function normalizeBook(document) {
  if (!document || typeof document.key !== "string" || typeof document.title !== "string") {
    return null;
  }

  const workId = document.key.split("/").filter(Boolean).at(-1);
  if (!workId) return null;

  const coverId = Number(document.cover_i);
  const isbn = Array.isArray(document.isbn)
    ? document.isbn.find((value) => typeof value === "string") ?? null
    : null;

  return {
    id: workId,
    source: "openlibrary",
    title: document.title.trim(),
    authors: Array.isArray(document.author_name)
      ? document.author_name.filter((author) => typeof author === "string")
      : [],
    firstPublishedYear: Number.isInteger(document.first_publish_year)
      ? document.first_publish_year
      : null,
    coverUrl: Number.isSafeInteger(coverId) && coverId > 0
      ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg?default=false`
      : null,
    isbn,
    editionCount: Number.isInteger(document.edition_count) ? document.edition_count : null,
    sourceUrl: `https://openlibrary.org/works/${encodeURIComponent(workId)}`,
  };
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fetchProviderJson(url) {
  const currentRequest = nextProviderRequest.then(async () => {
    const elapsed = Date.now() - lastProviderRequestAt;
    if (lastProviderRequestAt > 0 && elapsed < MIN_PROVIDER_INTERVAL_MS) {
      await wait(MIN_PROVIDER_INTERVAL_MS - elapsed);
    }

    lastProviderRequestAt = Date.now();
    return fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "BookHunt/1.0 (private reading companion)",
      },
      signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
    });
  });

  // Keep the queue alive if one upstream request fails.
  nextProviderRequest = currentRequest.then(() => undefined, () => undefined);

  let response;
  try {
    response = await currentRequest;
  } catch {
    throw new SearchProviderError("The book catalog could not be reached. Check your connection and try again.");
  }

  if (!response.ok) {
    throw new SearchProviderError(
      response.status === 429
        ? "The book catalog is receiving too many requests. Please wait a moment and try again."
        : "The book catalog is temporarily unavailable. Please try again.",
      response.status === 429 ? 503 : 502,
    );
  }

  try {
    return await response.json();
  } catch {
    throw new SearchProviderError("The book catalog returned an unreadable response.", 502);
  }
}

function readCachedSearch(cacheKey) {
  const cached = searchCache.get(cacheKey);
  if (!cached) return null;
  if (cached.expiresAt <= Date.now()) {
    searchCache.delete(cacheKey);
    return null;
  }

  // Refresh insertion order so the oldest entry can be evicted first.
  searchCache.delete(cacheKey);
  searchCache.set(cacheKey, cached);
  return cached.value;
}

function cacheSearch(cacheKey, value) {
  searchCache.delete(cacheKey);
  searchCache.set(cacheKey, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  if (searchCache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = searchCache.keys().next().value;
    searchCache.delete(oldestKey);
  }
}

export async function searchBooks({ query: rawQuery, page: rawPage }) {
  const query = typeof rawQuery === "string" ? rawQuery.trim() : "";
  if (query.length < 2) {
    throw new SearchProviderError("Enter at least 2 characters to search for a book.", 400);
  }
  if (query.length > 120) {
    throw new SearchProviderError("Search terms must be 120 characters or fewer.", 400);
  }

  const page = parsePage(rawPage);
  const cacheKey = `${query.toLocaleLowerCase()}|${page}`;
  const cached = readCachedSearch(cacheKey);
  if (cached) return cached;

  const inFlight = inFlightSearches.get(cacheKey);
  if (inFlight) return inFlight;

  const searchPromise = loadSearchResults({ cacheKey, query, page });
  inFlightSearches.set(cacheKey, searchPromise);
  try {
    return await searchPromise;
  } finally {
    inFlightSearches.delete(cacheKey);
  }
}

async function loadSearchResults({ cacheKey, query, page }) {
  const providerUrl = new URL(OPEN_LIBRARY_SEARCH_URL);
  providerUrl.searchParams.set("q", query);
  providerUrl.searchParams.set("page", String(page));
  providerUrl.searchParams.set("limit", String(RESULTS_PER_PAGE));
  providerUrl.searchParams.set(
    "fields",
    "key,title,author_name,first_publish_year,cover_i,isbn,edition_count",
  );

  const providerData = await fetchProviderJson(providerUrl);
  if (!providerData || !Array.isArray(providerData.docs)) {
    throw new SearchProviderError("The book catalog returned an unexpected response.", 502);
  }

  const books = providerData.docs.map(normalizeBook).filter(Boolean);
  const result = {
    query,
    page,
    pageSize: RESULTS_PER_PAGE,
    total: Number.isFinite(providerData.numFound ?? providerData.num_found)
      ? (providerData.numFound ?? providerData.num_found)
      : books.length,
    books,
  };

  cacheSearch(cacheKey, result);
  return result;
}
