/**
 * Persists drag-and-drop widget ordering to localStorage, keyed per dashboard/grid.
 * Falls back to the given default order whenever storage is empty, unavailable
 * (e.g. private browsing), or contains ids that no longer match the current widget set.
 */
export function loadOrder(storageKey: string, defaultOrder: string[]): string[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [...defaultOrder];
    const saved: string[] = JSON.parse(raw);
    const known = saved.filter((id) => defaultOrder.includes(id));
    const missing = defaultOrder.filter((id) => !known.includes(id));
    return [...known, ...missing];
  } catch {
    return [...defaultOrder];
  }
}

export function saveOrder(storageKey: string, order: string[]): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(order));
  } catch {
    // localStorage unavailable — ordering just won't persist across reloads
  }
}

/** Reorders `items` to match the saved order (matched via `keyOf`), keeping unknown/new items appended. */
export function reorderByKey<T>(items: T[], storageKey: string, keyOf: (item: T) => string): T[] {
  const defaultOrder = items.map(keyOf);
  const order = loadOrder(storageKey, defaultOrder);
  const byKey = new Map(items.map((item) => [keyOf(item), item]));
  return order.map((key) => byKey.get(key)).filter((item): item is T => !!item);
}
