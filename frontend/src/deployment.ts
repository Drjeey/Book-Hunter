// The public Netlify build has catalog search, but no private database or image store.
export const publicSearchOnly = import.meta.env.VITE_PUBLIC_SEARCH_ONLY === 'true'
