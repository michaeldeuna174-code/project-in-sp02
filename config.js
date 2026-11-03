/**
 * CyberSafe — Frontend API Configuration
 *
 * Configures the backend REST API URL for local development and production deployment (Render).
 * It detects the backend API URL in the following priority order:
 * 1. Runtime window override: window.CYBERSAFE_API_URL or window.__CYBERSAFE_API_URL__
 * 2. HTML meta tag: <meta name="backend-url" content="..."> in index.html
 * 3. Bundler environment variables (Vite / Create React App):
 *    - import.meta.env.VITE_API_URL
 *    - process.env.REACT_APP_API_URL
 * 4. Production Render backend fallback:
 *    - https://project-in-sp02.onrender.com/api
 * 5. Local development fallback:
 *    - http://localhost:5000/api (or /api when running on port 5000)
 */

(function () {
  "use strict";

  // 1. Read from HTML <meta name="backend-url" content="...">
  function getMetaBackendUrl() {
    try {
      const meta = document.querySelector('meta[name="backend-url"]');
      if (meta && meta.content) {
        return meta.content.trim();
      }
    } catch (e) {}
    return "";
  }

  // 2. Read from bundler environment variables (Vite / CRA)
  function getEnvBackendUrl() {
    try {
      if (typeof import.meta !== "undefined" && import.meta && import.meta.env) {
        if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL.trim();
        if (import.meta.env.VITE_BACKEND_URL) return import.meta.env.VITE_BACKEND_URL.trim();
      }
    } catch (e) {}

    try {
      if (typeof process !== "undefined" && process && process.env) {
        if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL.trim();
        if (process.env.REACT_APP_BACKEND_URL) return process.env.REACT_APP_BACKEND_URL.trim();
      }
    } catch (e) {}

    return "";
  }

  // 3. Detect if running in a local development environment
  function isLocalEnvironment() {
    const hostname = window.location.hostname || "";
    const protocol = window.location.protocol || "";
    return (
      protocol === "file:" ||
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]" ||
      hostname.endsWith(".local")
    );
  }

  // 4. Normalize URL so it always ends with /api and no trailing slash
  function normalizeApiUrl(url) {
    if (!url) return "";
    let clean = url.trim().replace(/\/+$/, "");
    if (!clean.endsWith("/api")) {
      clean = `${clean}/api`;
    }
    return clean;
  }

  // 5. Resolve the API base URL
  function resolveBackendApiUrl() {
    // A. Explicit global window override
    if (window.CYBERSAFE_API_URL && typeof window.CYBERSAFE_API_URL === "string") {
      return normalizeApiUrl(window.CYBERSAFE_API_URL);
    }
    if (window.__CYBERSAFE_API_URL__ && typeof window.__CYBERSAFE_API_URL__ === "string") {
      return normalizeApiUrl(window.__CYBERSAFE_API_URL__);
    }

    // B. Bundler environment variables (Vite / CRA)
    const envUrl = getEnvBackendUrl();
    if (envUrl) {
      return normalizeApiUrl(envUrl);
    }

    // C. HTML meta tag override in index.html
    const metaUrl = getMetaBackendUrl();
    if (metaUrl) {
      return normalizeApiUrl(metaUrl);
    }

    // D. Local development environment fallback
    if (isLocalEnvironment()) {
      if (window.location.port === "5000") {
        return "/api";
      }
      return "http://localhost:5000/api";
    }

    // E. Production Render backend fallback
    // Deployed Render backend for the CyberSafe project
    return "https://project-in-sp02.onrender.com/api";
  }

  const resolvedUrl = resolveBackendApiUrl();

  // Expose globally for all frontend scripts
  window.CYBERSAFE_API_URL = resolvedUrl;
  window.__CYBERSAFE_API_URL__ = resolvedUrl;
  window.getCyberSafeApiUrl = function () {
    return window.CYBERSAFE_API_URL || resolvedUrl;
  };
})();
