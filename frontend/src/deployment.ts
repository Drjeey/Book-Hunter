// The Netlify build stores its personal library in the browser; shelf OCR still needs local Node.
export const publicSite = import.meta.env.VITE_PUBLIC_SITE === 'true'
