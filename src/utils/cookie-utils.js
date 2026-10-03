// utils/cookie-utils.js

export const CookieManager = {
  set: (name, value, options = {}) => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(name, value);
    } catch (e) {}

    let expires = "";
    if (typeof options === "number") {
      expires = "; expires=" + new Date(Date.now() + options * 864e5).toUTCString();
    } else if (options.expires) {
      const days = options.expires;
      expires = "; expires=" + new Date(Date.now() + days * 864e5).toUTCString();
    }

    const path = options.path ? "; path=" + options.path : "; path=/";
    const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
    const secure = (options.secure && isHttps) ? "; secure" : "";
    const sameSite = options.sameSite ? "; samesite=" + options.sameSite : "; samesite=Lax";

    document.cookie = name + "=" + encodeURIComponent(value) + expires + path + secure + sameSite;
  },

  get: (name) => {
    if (typeof window === "undefined") return null;

    let cookieVal = null;
    if (document.cookie) {
      const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
        const parts = cookie.split("=");
        const key = parts[0];
        const val = parts.slice(1).join("=");
        if (key) acc[key.trim()] = decodeURIComponent(val);
        return acc;
      }, {});
      cookieVal = cookies[name];
    }

    if (cookieVal) return cookieVal;

    try {
      return localStorage.getItem(name);
    } catch (e) {
      return null;
    }
  },

  remove: (name) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(name);
    } catch (e) {}
    document.cookie = name + "=; expires=" + new Date(0).toUTCString() + "; path=/";
  },
};
