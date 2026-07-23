import { Injectable } from '@nestjs/common';
import { ConfigDomain, EnvVariable } from '../registry/registry.decorators';
import { IsBoolean } from 'class-validator';

const TRUTHY = new Set(['true', '1', 'yes', 'on']);
const FALSY = new Set(['false', '0', 'no', 'off', '']);

/**
 * Parse the operator-controlled AUTH_DISABLED flag.
 *
 * Secure by default: an unset value resolves to `false` (auth enabled). Only an
 * explicit truthy token (`true`/`1`/`yes`/`on`) enables the bypass; recognized
 * falsy tokens resolve to `false`. Anything else returns `undefined` so the
 * @IsBoolean validation fails and the app REFUSES to boot rather than guessing.
 */
export function parseAuthDisabled(
  raw: string | boolean | undefined | null,
): boolean | undefined {
  if (typeof raw === 'boolean') return raw;
  if (raw === undefined || raw === null) return false;
  const value = String(raw).trim().toLowerCase();
  if (TRUTHY.has(value)) return true;
  if (FALSY.has(value)) return false;
  return undefined;
}

/**
 * Authentication configuration domain.
 *
 * Owns the reversible AUTH_DISABLED switch consumed by AuthBypassService and
 * JwtAuthGuard. The flag never accepts identity from a request; it only gates
 * whether real JWT validation runs, so it cannot reintroduce an auth-bypass
 * hole. Validated declaratively by the EnterpriseConfigModule at startup.
 */
@Injectable()
@ConfigDomain({ owner: 'Auth', feature: 'Configuration', version: '1.0.0', description: 'AuthConfig Domain' })
export class AuthConfig {
  @IsBoolean()
  @EnvVariable('AUTH_DISABLED')
  readonly authDisabled: boolean = false;
}
