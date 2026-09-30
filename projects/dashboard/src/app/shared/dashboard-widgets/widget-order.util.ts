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

/**
 * Applies a drag-and-drop move made in a filtered (visible-only) list to the full list,
 * so hidden widgets keep their place. `prev`/`cur` are indexes within the visible items.
 */
export function moveWithinVisible<T>(all: T[], isVisible: (item: T) => boolean, prev: number, cur: number): void {
  const visible = all.filter(isVisible);
  const from = all.indexOf(visible[prev]);
  const to = all.indexOf(visible[cur]);
  if (from < 0 || to < 0 || from === to) return;
  const [item] = all.splice(from, 1);
  all.splice(to, 0, item);
}

/** Reorders `items` to match the saved order (matched via `keyOf`), keeping unknown/new items appended. */
export function reorderByKey<T>(items: T[], storageKey: string, keyOf: (item: T) => string): T[] {
  const defaultOrder = items.map(keyOf);
  const order = loadOrder(storageKey, defaultOrder);
  const byKey = new Map(items.map((item) => [keyOf(item), item]));
  return order.map((key) => byKey.get(key)).filter((item): item is T => !!item);
}
