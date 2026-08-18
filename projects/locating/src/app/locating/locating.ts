import {
  Component,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapComponent, MapLocation } from '../../../shared/map/map';

export type TrackMode = 'people' | 'assets';

export interface LocationNode {
  name: string;
  /** Lat/Lng + zoom the map should fly to when this row becomes active. */
  coords: { lat: number; lng: number; zoom: number };
  children?: LocationNode[];
}

@Component({
  standalone: true,
  selector: 'app-locating',
  imports: [CommonModule, FormsModule, MapComponent],
  templateUrl: './locating.html',
  styleUrls: ['./locating.css'],
})
export class Locating {
  mode: TrackMode = 'people';

  // The full chain we render in the cascade.
  // Coords roughly approximate UAE → Oman → Muscat area → street → building,
  // with progressively deeper zoom levels so each click visibly zooms in.
  isPanelCollapsed = false;

  togglePanel(): void {
    this.isPanelCollapsed = !this.isPanelCollapsed;
  }
  locationTree: LocationNode[] = [
    {
      name: 'UAE',
      coords: { lat: 24.4539, lng: 54.3773, zoom: 6 },
      children: [
        {
          name: 'Oman',
          coords: { lat: 23.585, lng: 58.405, zoom: 7 },
          children: [
            {
              name: 'Street One',
              coords: { lat: 23.612, lng: 58.539, zoom: 13 },
              children: [
                {
                  name: 'Second Colony',
                  coords: { lat: 23.6145, lng: 58.541, zoom: 15 },
                  children: [
                    {
                      name: 'Third Right',
                      coords: { lat: 23.6155, lng: 58.542, zoom: 17 },
                      children: [
                        {
                          name: 'Azy floor',
                          coords: { lat: 23.6158, lng: 58.5423, zoom: 19 },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  expanded: Set<string> = new Set<string>();

  @ViewChild(MapComponent, { static: false }) mapComponent?: MapComponent;

  get modeLabel(): string {
    return this.mode === 'people' ? 'Track People' : 'Track Assets';
  }

  get visibleChain(): string[] {
    const chain: string[] = [this.modeLabel];
    if (!this.expanded.has(this.modeLabel)) return chain;

    let node: LocationNode | undefined = this.locationTree[0];
    while (node && node.children && node.children.length > 0) {
      const next: LocationNode = node.children[0];
      if (!this.expanded.has(node.name)) break;
      chain.push(next.name);
      node = next;
    }
    return chain;
  }

  /** Coords of the deepest expanded row, falling back to the root. */
  get activeCoords(): { lat: number; lng: number; zoom: number } {
    const names = this.visibleChain.slice(1); // drop the mode label
    let node: LocationNode | undefined = this.locationTree[0];
    let coords: { lat: number; lng: number; zoom: number } | undefined = node?.coords;
    for (const name of names) {
      if (!node || !node.children) break;
      const next: LocationNode | undefined = node.children.find((c) => c.name === name);
      if (!next) break;
      node = next;
      coords = next.coords;
    }
    return coords as { lat: number; lng: number; zoom: number };
  }

  isActive(name: string): boolean {
    if (name === this.modeLabel) return false;
    const chain = this.visibleChain;
    return chain[chain.length - 1] === name;
  }

  isExpandable(name: string): boolean {
    if (name === this.modeLabel) return !this.expanded.has(this.modeLabel);
    if (this.expanded.has(name)) return false;
    return this.findNode(name)?.children?.length ? true : false;
  }

  /** Coords for the map component as MapLocation[] */
  get mapLocations(): MapLocation[] {
    return this.locationTree;
  }

  /** When the deepest active row is "Third Right" or "Azy floor", show a static image instead of the live map. */
  get mapOverlayImage(): string | null {
    const activeName = this.visibleChain[this.visibleChain.length - 1];
    if (activeName === 'Third Right') return '/mapp.png';
    if (activeName === 'Azy floor') return '/mappp.png';
    return null;
  }

  /**
   * Click handler: expand the row, then fly the map to that node's coords.
   */
  toggle(name: string): void {
    if (name === this.modeLabel) {
      const next = new Set(this.expanded);
      if (next.has(this.modeLabel)) {
        next.delete(this.modeLabel);
        this.locationTree.forEach((node) => {
          const collectDescendants = (n: LocationNode) => {
            next.delete(n.name);
            (n.children ?? []).forEach((child) => collectDescendants(child));
          };
          collectDescendants(node);
        });
      } else {
        next.add(this.modeLabel);
        if (this.locationTree[0]) {
          next.add(this.locationTree[0].name);
        }
      }
      this.expanded = next;
      return;
    }

    const isCurrentlyExpanded = this.expanded.has(name);

    if (isCurrentlyExpanded) {
      const next = new Set(this.expanded);
      next.delete(name);

      const node = this.findNode(name);
      if (node?.children?.length) {
        const collectDescendants = (n: LocationNode) => {
          (n.children ?? []).forEach((child) => {
            next.delete(child.name);
            collectDescendants(child);
          });
        };
        collectDescendants(node);
      }

      this.expanded = next;
      return;
    }

    if (!this.isExpandable(name)) return;
    this.expanded = new Set(this.expanded).add(name);

    const node = this.findNode(name);
    if (this.mapComponent && node) {
      this.mapComponent.flyTo(node.coords);
    }
  }

  private findNode(name: string): LocationNode | undefined {
    const stack: LocationNode[] = [this.locationTree[0]];
    while (stack.length) {
      const n: LocationNode = stack.pop()!;
      if (n.name === name) return n;
      if (n.children) stack.push(...n.children);
    }
    return undefined;
  }

  trackByName = (_: number, name: string) => name;

  // ===== Right-side filter state =====
  selectedDevice: string = 'fixed';
  devices = [
    { label: 'Fixed', value: 'fixed' },
    { label: 'Mobile', value: 'mobile' },
    { label: 'Wearable', value: 'wearable' },
    { label: 'Bluetooth Beacon', value: 'beacon' },
  ];

  selectedParameter: string = '';
  parameters = [
    { label: 'Heart Rate', value: 'heart_rate' },
    { label: 'Body Temperature', value: 'body_temperature' },
    { label: 'Location', value: 'location' },
    { label: 'Movement Status', value: 'movement' },
    { label: 'Battery Level', value: 'battery' },
  ];
selectedPeriod: 'day' | 'week' | 'month' = 'month';
isStatsModalOpen = false;

stats = {
  topZone: 'Zone A',
  peakTime: '14:00',
  peakDay: 'Monday',
};

// Full list mirrors the reference popup. Only keys present in `stats`
// actually render a card right now — the rest are placeholders for later.
statOptions: { key: string; label: string; checked: boolean }[] = [
  { key: 'topZone', label: 'Top Zone', checked: true },
  { key: 'peakTime', label: 'Peak Time', checked: true },
  { key: 'peakDay', label: 'Peak Day', checked: true },
  
];

selectPeriod(period: 'day' | 'week' | 'month'): void {
  this.selectedPeriod = period;
}

openStatsModal(): void {
  this.isStatsModalOpen = true;
}

closeStatsModal(): void {
  this.isStatsModalOpen = false;
}

toggleStatOption(key: string): void {
  const opt = this.statOptions.find((o) => o.key === key);
  if (opt) opt.checked = !opt.checked;
}

saveStatsSelection(): void {
  this.isStatsModalOpen = false;
}

isStatVisible(key: string): boolean {
  return this.statOptions.find((o) => o.key === key)?.checked ?? false;
}
  // ===== Tracked people summary (static) =====
  trackedPeople = [
    { name: 'Assets1', location: 'Azy floor - Room 101', status: 'online' as const },
    { name: 'Assets2', location: 'Azy floor - Room 102', status: 'online' as const },
    { name: 'Assets3', location: 'Azy floor - Room 103', status: 'idle' as const },
    { name: 'Assets4', location: 'Azy floor - Room 101', status: 'offline' as const },
  ];
}