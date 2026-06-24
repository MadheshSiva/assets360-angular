import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { loadLeaflet } from './leaflet-loader';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './locating.html',
  styleUrls: ['./locating.css'],
})
export class Locating implements AfterViewInit, OnDestroy {
  mode: TrackMode = 'people';

  // The full chain we render in the cascade.
  // Coords roughly approximate UAE → Oman → Muscat area → street → building,
  // with progressively deeper zoom levels so each click visibly zooms in.
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

  @ViewChild('mapEl', { static: false }) mapEl?: ElementRef<HTMLDivElement>;
  // `any` here on purpose — Leaflet's full type surface is huge, and we only
  // touch a handful of methods. Keeps the component file readable and avoids
  // fighting the @types/leaflet definitions.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private map?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private marker?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private L?: any;

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async ngAfterViewInit(): Promise<void> {
    if (!this.isBrowser || !this.mapEl) return;
    this.L = await loadLeaflet();
    const L = this.L;

    // Default Leaflet marker icon URLs from the leaflet CDN.
    const icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    const start: { lat: number; lng: number; zoom: number } = this.locationTree[0].coords;
    this.map = L.map(this.mapEl.nativeElement, {
      center: [start.lat, start.lng],
      zoom: start.zoom,
      zoomControl: false,
      attributionControl: true,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    // Drop the initial marker on the root location so the map isn't empty.
    this.marker = L.marker([start.lat, start.lng], { icon }).addTo(this.map);

    // Re-flow the map after Angular finishes laying out the DOM. Two passes —
    // the first is a quick check, the second waits long enough for the layout
    // grid to settle so the canvas gets the correct dimensions.
    setTimeout(() => this.map?.invalidateSize(), 100);
    setTimeout(() => this.map?.invalidateSize(), 400);
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = undefined;
  }

  get modeLabel(): string {
    return this.mode === 'people' ? 'Track People' : 'Track Assets';
  }

  get visibleChain(): string[] {
    const chain: string[] = [this.modeLabel, this.locationTree[0].name];
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
    if (this.expanded.has(name)) return false;
    return this.findNode(name)?.children?.length ? true : false;
  }

  /**
   * Click handler: expand the row, then fly the map to that node's coords.
   */
  toggle(name: string): void {
    const isCurrentlyExpanded = this.expanded.has(name);

    // Clicking again collapses the row.
    if (isCurrentlyExpanded) {
      const next = new Set(this.expanded);
      next.delete(name);

      // Also collapse everything deeper than this node so the chain stays consistent.
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

    // Expand.
    if (!this.isExpandable(name)) return;
    this.expanded = new Set(this.expanded).add(name);

    const node = this.findNode(name);
    if (this.map && this.L && node) {
      const c = node.coords;
      this.map.flyTo([c.lat, c.lng], c.zoom, { duration: 0.8 });
      if (this.marker) {
        this.marker.setLatLng([c.lat, c.lng]);
      } else {
        this.marker = this.L.marker([c.lat, c.lng]).addTo(this.map);
      }
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

  // Map zoom controls (wired to Leaflet)
  zoomIn(): void {
    this.map?.zoomIn();
  }

  zoomOut(): void {
    this.map?.zoomOut();
  }

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

  // ===== Tracked people summary (static) =====
  trackedPeople = [
    { name: 'Ahmed Al-Rashid', location: 'Azy floor - Room 101', status: 'online' as const },
    { name: 'Sara Mohammed',  location: 'Azy floor - Room 102', status: 'online' as const },
    { name: 'Khalid Hassan',  location: 'Azy floor - Room 103', status: 'idle' as const },
    { name: 'Fatima Ali',     location: 'Azy floor - Room 101', status: 'offline' as const },
  ];
}
