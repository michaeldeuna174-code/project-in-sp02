/**
 * CyberSafe — Frontend API Configuration
 *
 * Configures the backend REST API URL for the deployed Render backend:
 * import.meta.env.VITE_API_URL || 'https://cybersafeawareness-backend.onrender.com'
 */

(function () {
  "use strict";

  function getBaseUrl() {
    let envUrl = "";

    // 1. Read from Vite environment variable
    try {
      if (typeof import.meta !== "undefined" && import.meta?.env?.VITE_API_URL) {
        envUrl = import.meta.env.VITE_API_URL;
      }
    } catch (e) {}

    // 2. Read from Create React App environment variable
    try {
      if (!envUrl && typeof process !== "undefined" && process?.env?.REACT_APP_API_URL) {
        envUrl = process.env.REACT_APP_API_URL;
      }
    } catch (e) {}

    // 3. Read from HTML meta tag: <meta name="backend-url" content="...">
    if (!envUrl) {
      try {
        const meta = document.querySelector('meta[name="backend-url"]');
        if (meta && meta.content) {
          envUrl = meta.content.trim();
        }
      } catch (e) {}
    }

    // 4. Fallback directly to the live Render backend URL
    const rawUrl =
      envUrl ||
      (typeof window !== "undefined" && (window.CYBERSAFE_API_URL || window.__CYBERSAFE_API_URL__)) ||
      "https://cybersafeawareness-backend.onrender.com";

    const clean = String(rawUrl).trim().replace(/\/+$/, "");
    return clean.endsWith("/api") ? clean : `${clean}/api`;
  }

  const apiUrl = getBaseUrl();

  // Expose globally for vanilla frontend scripts
  window.CYBERSAFE_API_URL = apiUrl;
  window.__CYBERSAFE_API_URL__ = apiUrl;
  window.getCyberSafeApiUrl = function () {
    return window.CYBERSAFE_API_URL || apiUrl;
  };
})();
