/**
 * Leaflet loader.
 *
 * Leaflet touches `window` at module top level, so it must NEVER be evaluated
 * during SSR. Vite's SSR pre-bundler cannot analyze strings computed at runtime.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-implied-eval
export async function loadLeaflet(): Promise<any> {
  // Keep this file SSR-safe: only import on the client.
  // Use a static specifier so the browser can resolve the module reliably.
  const mod: any = await import('leaflet');
  // Leaflet ships as UMD/CJS. Depending on the bundler's interop (dev server
  // vs. the esbuild production build used for deployment), the real API can
  // land on `mod` directly or be nested under `mod.default`. Normalize both.
  return mod.icon ? mod : mod.default;
}