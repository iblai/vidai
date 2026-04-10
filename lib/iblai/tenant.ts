
/**
 * Tenant resolution for ibl.ai apps.
 *
 * Priority:
 *   1. .env (NEXT_PUBLIC_MAIN_TENANT_KEY) — source of truth
 *   2. app_tenant localStorage — cached resolved value
 *   3. tenant localStorage — set by SDK TenantProvider
 *
 * When the SDK's tenant doesn't match the resolved app tenant,
 * the user is redirected to the auth SPA to re-login for the correct tenant.
 */

import config from "@/lib/iblai/config";

const PLACEHOLDER_TENANTS = new Set([
  "your-tenant",
  "your-platform",
  "your-tenant-key",
  "test-tenant",
  "main",
  "",
]);

/**
 * Resolve the current tenant key.
 *
 * Saves the resolved value to `app_tenant` localStorage for fast subsequent
 * reads so that components don't need to call `config.mainTenantKey()` on
 * every render.
 */
export function resolveAppTenant(): string {
  if (typeof window === "undefined") return "";

  // 1. .env (source of truth)
  const envTenant = config.mainTenantKey();
  if (envTenant && !PLACEHOLDER_TENANTS.has(envTenant)) {
    localStorage.setItem("app_tenant", envTenant);
    return envTenant;
  }

  // 2. app_tenant (cached from a previous resolve)
  const appTenant = localStorage.getItem("app_tenant");
  if (appTenant) return appTenant;

  // 3. tenant (set by SDK TenantProvider)
  const sdkTenant = localStorage.getItem("tenant");
  if (sdkTenant) {
    localStorage.setItem("app_tenant", sdkTenant);
    return sdkTenant;
  }

  return "";
}

/**
 * Check if the SDK's current tenant matches the app's resolved tenant.
 *
 * If they differ, redirect to the auth SPA to re-login for the correct
 * tenant. Returns `true` if a redirect was triggered (caller should stop
 * rendering).
 */
export function checkTenantMismatch(): boolean {
  if (typeof window === "undefined") return false;

  const appTenant = resolveAppTenant();
  const sdkTenant = localStorage.getItem("tenant") ?? "";

  if (appTenant && sdkTenant && sdkTenant !== appTenant) {
    // Use dynamic import to avoid hard dependency on auth-utils from tenant module.
    // On Tauri mobile this routes through the navigate_to command to bypass
    // Android WebView's external URL blocking.
    import("./auth-utils").then(({ redirectToAuthSpa }) => {
      redirectToAuthSpa(undefined, appTenant, false, false);
    });
    return true;
  }
  return false;
}
