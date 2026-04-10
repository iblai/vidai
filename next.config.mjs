// ibl.ai: Node.js 22+ localStorage polyfill (missing getItem/setItem in SSR)
if (typeof window === "undefined" && typeof localStorage !== "undefined" && typeof localStorage.getItem !== "function") {
  const _s = {};
  globalThis.localStorage = {
    getItem: (k) => (_s[k] ?? null),
    setItem: (k, v) => { _s[k] = String(v); },
    removeItem: (k) => { delete _s[k]; },
    clear: () => { for (const k in _s) delete _s[k]; },
    get length() { return Object.keys(_s).length; },
    key: (i) => Object.keys(_s)[i] ?? null,
  };
}

import { createRequire } from "module";

const require = createRequire(import.meta.url);

/**
 * Resolve a package to its root directory so webpack never loads duplicate
 * copies (can happen in npm/pnpm hoisting with differing peer deps).
 */
function dedup(packageName) {
  try {
    const entry = require.resolve(packageName);
    const marker = `node_modules/${packageName}`;
    const idx = entry.lastIndexOf(marker);
    if (idx !== -1) return entry.slice(0, idx + marker.length);
    return undefined;
  } catch {
    return undefined;
  }
}

const resolveAliases = {};
const dataLayerDir = dedup("@iblai/data-layer");
if (dataLayerDir) resolveAliases["@iblai/data-layer"] = dataLayerDir;
const rtkDir = dedup("@reduxjs/toolkit");
if (rtkDir) resolveAliases["@reduxjs/toolkit"] = rtkDir;
const reactReduxDir = dedup("react-redux");
if (reactReduxDir) resolveAliases["react-redux"] = reactReduxDir;

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  turbopack: {},
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    // ibl.ai: Stub @tauri-apps/api imports (not needed for web-only apps)
    config.resolve.alias["@tauri-apps/api/core"] = false;
    config.resolve.alias["@tauri-apps/api/event"] = false;
    // ibl.ai: Deduplicate @reduxjs/toolkit + react-redux (shared Redux context)
    Object.assign(config.resolve.alias, resolveAliases);
    return config;
  },
}

export default nextConfig
