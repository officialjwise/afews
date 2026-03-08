/**
 * Centralised API configuration.
 * All API calls must import API_BASE_URL from here rather than reading
 * import.meta.env directly, so there is a single place to update the base
 * URL for different deployment environments.
 *
 * The value comes from the VITE_API_BASE environment variable set in .env.
 * Fallback: "/v1" (relative, suits same-origin deployments behind a reverse proxy).
 */
const API_BASE_URL: string = import.meta.env.VITE_API_BASE ?? "/v1";

export default API_BASE_URL;
