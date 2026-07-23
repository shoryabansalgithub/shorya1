/**
 * DI token for the S3 client provider.
 *
 * Kept in its own import-free module to break the circular import between
 * storage.module.ts (imports StorageService) and storage.service.ts (needs the
 * token). When the token lived in storage.module.ts, CommonJS load order left
 * it `undefined` at the moment StorageService's `@Inject(S3_CLIENT)` decorator
 * ran, so Nest could not resolve the dependency and the app failed to boot.
 */
export const S3_CLIENT = 'S3_CLIENT';
