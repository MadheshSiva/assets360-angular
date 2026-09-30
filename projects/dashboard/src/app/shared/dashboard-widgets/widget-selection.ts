/**
 * Persists which dashboard widgets the user selected (full ids from WIDGET_CATALOG,
 * e.g. 'asset.stat:Total Assets') to localStorage.
 */
const SELECTION_KEY = 'piq.dashboard.selectedWidgets';
// Written by the short-lived "custom tabs" version; its widgets are merged in once
const LEGACY_TABS_KEY = 'piq.dashboard.tabs';

const toIds = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [];

export function loadSelectedWidgets(): string[] {
  try {
    const raw = localStorage.getItem(SELECTION_KEY);
    if (raw) return toIds(JSON.parse(raw));

    const legacy = JSON.parse(localStorage.getItem(LEGACY_TABS_KEY) ?? 'null') as { tabs?: { widgets?: unknown }[] } | null;
    const merged = (legacy?.tabs ?? []).flatMap((t) => toIds(t.widgets));
    return [...new Set(merged)];
  } catch {
    return [];
  }
}

export function saveSelectedWidgets(ids: string[]): void {
  try {
    localStorage.setItem(SELECTION_KEY, JSON.stringify(ids));
    localStorage.removeItem(LEGACY_TABS_KEY);
  } catch {
    // localStorage unavailable — selection just won't persist across reloads
  }
}
