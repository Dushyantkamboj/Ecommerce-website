// The API base URL is injected at build time from VITE_API_URL.
// Local development keeps using the backend running on port 3000.
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");
