import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  inject,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { loadLeaflet } from './leaflet-loader';

export interface MapLocation {
  name: string;
  coords: { lat: number; lng: number; zoom: number };
  children?: MapLocation[];
}

export interface MapPin {
  lat: number;
  lng: number;
  color?: string;
  label?: string;
  kind?: 'count' | 'device' | 'camera';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
}

@Component({
  standalone: true,
  selector: 'app-map',
  imports: [CommonModule],
  templateUrl: './map.html',
  styleUrls: ['./map.css'],
})
export class MapComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() locations: MapLocation[] = [];
  @Input() pins: MapPin[] = [];

  @Output() locationClick = new EventEmitter<MapLocation>();
  @Output() pinClick = new EventEmitter<MapPin>();

  @ViewChild('mapEl', { static: false }) mapEl?: ElementRef<HTMLDivElement>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private map?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private marker?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private markersLayer?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private L?: any;

  private readonly isBrowser: boolean;
  /** Guards against overlapping initializeMap() calls while the async Leaflet load is in flight. */
  private mapInitStarted = false;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async ngAfterViewInit(): Promise<void> {
    if (!this.isBrowser || !this.mapEl) return;
    if (this.locations.length === 0 && this.pins.length === 0) return;
    await this.initializeMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['locations'] && !changes['locations'].firstChange && this.map) {
      this.updateInitialLocation();
    }
    if (changes['pins'] && !changes['pins'].firstChange) {
      if (this.map) {
        this.renderPins();
      } else if (this.isBrowser && this.mapEl && this.pins.length > 0 && !this.mapInitStarted) {
        this.initializeMap();
      }
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = undefined;
  }

  private async initializeMap(): Promise<void> {
    if (this.mapInitStarted || this.map) return;
    if (!this.mapEl || (this.locations.length === 0 && this.pins.length === 0)) return;
    this.mapInitStarted = true;
    this.L = await loadLeaflet();
    const L = this.L;

    if (this.pins.length > 0) {
      this.map = L.map(this.mapEl.nativeElement, {
        zoomControl: false,
        attributionControl: true,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      }).addTo(this.map);

      this.renderPins();

      setTimeout(() => this.map?.invalidateSize(), 100);
      setTimeout(() => this.map?.invalidateSize(), 400);
      return;
    }

    const icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    const start = this.locations[0].coords;
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

    this.marker = L.marker([start.lat, start.lng], { icon }).addTo(this.map);

    setTimeout(() => this.map?.invalidateSize(), 100);
    setTimeout(() => this.map?.invalidateSize(), 400);
  }

  private renderPins(): void {
    if (!this.map || !this.L) return;
    const L = this.L;

    this.markersLayer?.clearLayers();
    this.markersLayer ??= L.layerGroup().addTo(this.map);

    this.pins.forEach((pin) => {
      const pinIcon = L.divIcon({
        className: 'colored-pin-icon',
        html: this.buildPinSvg(pin.color || '#2563eb'),
        iconSize: [28, 34],
        iconAnchor: [14, 34],
      });
      const marker = L.marker([pin.lat, pin.lng], { icon: pinIcon }).addTo(this.markersLayer);
      if (pin.kind) {
        marker.on('click', () => this.pinClick.emit(pin));
      }
    });

    if (this.pins.length > 0) {
      const bounds = L.latLngBounds(this.pins.map((pin) => [pin.lat, pin.lng]));
      this.map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
    }
  }

  private buildPinSvg(color: string): string {
    return `<svg width="28" height="34" viewBox="0 0 24 30" xmlns="http://www.w3.org/2000/svg">
      <path fill="${color}" stroke="white" stroke-width="1" d="M12 0C5.9 0 1 4.9 1 11c0 8.25 11 18 11 18s11-9.75 11-18c0-6.1-4.9-11-11-11z"/>
      <circle cx="12" cy="11" r="4.2" fill="white"/>
    </svg>`;
  }

  private updateInitialLocation(): void {
    if (!this.map || !this.marker || this.locations.length === 0) return;
    const start = this.locations[0].coords;
    this.map.setView([start.lat, start.lng], start.zoom);
    this.marker.setLatLng([start.lat, start.lng]);
  }

  flyTo(coords: { lat: number; lng: number; zoom: number }): void {
    if (this.map && this.L) {
      this.map.flyTo([coords.lat, coords.lng], coords.zoom, { duration: 0.8 });
      if (this.marker) {
        this.marker.setLatLng([coords.lat, coords.lng]);
      }
    }
  }

  zoomIn(): void {
    this.map?.zoomIn();
  }

  zoomOut(): void {
    this.map?.zoomOut();
  }
}