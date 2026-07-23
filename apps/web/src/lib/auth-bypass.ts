/**
 * Operator-controlled auth bypass for the web app, mirroring the API's
 * AUTH_DISABLED flag. NEXT_PUBLIC_* values are inlined into the bundle at
 * build time, so the flag must be set when `next build` runs (and in the
 * runtime environment, for middleware).
 *
 * Secure by default: unset, empty, or unrecognized values keep the login
 * gate active. Only an explicit truthy value skips it.
 */
export const AUTH_DISABLED = ['1', 'true', 'yes', 'on'].includes(
  (process.env.NEXT_PUBLIC_AUTH_DISABLED ?? '').trim().toLowerCase(),
);
