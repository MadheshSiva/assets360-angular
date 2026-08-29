import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
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

export interface GeoZone {
  id: string;
  latlngs: { lat: number; lng: number }[];
  color: string;
  opacity: number;
}

export interface ZoneSensor {
  id: string;
  zoneId: string;
  lat: number;
  lng: number;
}

const GEO_ZONE_COLORS = [
  { label: 'Purple', value: '#5b3df5' },
  { label: 'Red', value: '#c22a3e' },
  { label: 'Green', value: '#158b4b' },
  { label: 'Amber', value: '#a8650a' },
  { label: 'Blue', value: '#2563eb' },
];

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
  @Output() zoneDrawn = new EventEmitter<GeoZone>();
  @Output() zoneDeleted = new EventEmitter<string>();
  @Output() sensorAdded = new EventEmitter<ZoneSensor>();
  @Output() sensorRemoved = new EventEmitter<string>();

  readonly zoneColors = GEO_ZONE_COLORS;

  isDrawing = false;
  drawColor = GEO_ZONE_COLORS[0].value;
  drawOpacity = 0.4;
  selectedZoneId: string | null = null;
  showColorPicker = false;
  showOpacitySlider = false;
  isPlacingSensor = false;

  private drawnZones: GeoZone[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private drawnLayer?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private previewLayer?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private drawingLatLngs: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private zoneLayerById = new Map<string, any>();

  private sensors: ZoneSensor[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sensorLayer?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sensorMarkerById = new Map<string, any>();

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

  // ===== Draw geo-referenced zones directly on the live map (real lat/lng polygons) =====

  get selectedZone(): GeoZone | null {
    return this.drawnZones.find((zone) => zone.id === this.selectedZoneId) ?? null;
  }

  toggleDraw(): void {
    if (!this.map || !this.L) return;
    this.stopPlacingSensors();
    this.isDrawing = !this.isDrawing;
    this.showColorPicker = false;
    this.showOpacitySlider = false;
    this.selectedZoneId = null;
    this.drawingLatLngs = [];
    this.clearPreview();

    if (this.isDrawing) {
      this.map.dragging.disable();
      this.map.doubleClickZoom.disable();
      this.map.on('click', this.handleDrawClick);
      this.map.on('dblclick', this.handleDrawDblClick);
    } else {
      this.stopDrawListening();
    }
  }

  private stopDrawListening(): void {
    if (!this.map) return;
    this.map.dragging.enable();
    this.map.doubleClickZoom.enable();
    this.map.off('click', this.handleDrawClick);
    this.map.off('dblclick', this.handleDrawDblClick);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleDrawClick = (e: any): void => {
    // Clicking back near the starting point closes the shape (standard GIS UX) —
    // more reliable than depending on a native dblclick, which some trackpads/browsers
    // don't consistently deliver.
    if (this.drawingLatLngs.length >= 3) {
      const firstPt = this.map.latLngToContainerPoint(this.drawingLatLngs[0]);
      const clickPt = e.containerPoint ?? this.map.latLngToContainerPoint(e.latlng);
      if (firstPt.distanceTo(clickPt) <= 12) {
        this.finalizeZone();
        return;
      }
    }
    this.drawingLatLngs = [...this.drawingLatLngs, e.latlng];
    this.renderPreview();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleDrawDblClick = (): void => {
    if (this.drawingLatLngs.length < 3) return;
    this.finalizeZone();
  };

  @HostListener('document:keydown.enter')
  onEnterKey(): void {
    if (!this.isDrawing || this.drawingLatLngs.length < 3) return;
    this.finalizeZone();
  }

  private renderPreview(): void {
    const L = this.L;
    this.previewLayer?.remove();
    if (this.drawingLatLngs.length === 0) return;

    this.previewLayer = L.layerGroup().addTo(this.map);
    L.polyline(this.drawingLatLngs, { color: this.drawColor, weight: 2, dashArray: '4,4' }).addTo(
      this.previewLayer,
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.drawingLatLngs.forEach((ll: any) => {
      L.circleMarker(ll, { radius: 4, color: this.drawColor, fillColor: this.drawColor, fillOpacity: 1 }).addTo(
        this.previewLayer,
      );
    });
  }

  private clearPreview(): void {
    this.previewLayer?.remove();
    this.previewLayer = undefined;
  }

  private finalizeZone(): void {
    const zone: GeoZone = {
      id: crypto.randomUUID(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      latlngs: this.drawingLatLngs.map((ll: any) => ({ lat: ll.lat, lng: ll.lng })),
      color: this.drawColor,
      opacity: this.drawOpacity,
    };
    this.drawnZones = [...this.drawnZones, zone];
    this.renderZone(zone);
    this.zoneDrawn.emit(zone);

    this.drawingLatLngs = [];
    this.clearPreview();
    this.isDrawing = false;
    this.stopDrawListening();
    this.selectedZoneId = zone.id;
  }

  private renderZone(zone: GeoZone): void {
    const L = this.L;
    this.drawnLayer ??= L.layerGroup().addTo(this.map);
    const layer = L.polygon(
      zone.latlngs.map((p) => [p.lat, p.lng]),
      { color: zone.color, weight: 2, fillColor: zone.color, fillOpacity: zone.opacity },
    ).addTo(this.drawnLayer);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    layer.on('click', (evt: any) => {
      L.DomEvent.stopPropagation(evt);
      if (this.isDrawing) return;
      if (this.isPlacingSensor) {
        // The zone's fill intercepts the click before it reaches the map, so
        // sensor placement has to be handled here too, not just in handleSensorClick.
        this.tryAddSensorAt(evt.latlng, zone.id);
        return;
      }
      this.stopPlacingSensors();
      this.selectedZoneId = this.selectedZoneId === zone.id ? null : zone.id;
      this.showColorPicker = false;
      this.showOpacitySlider = false;
    });

    this.zoneLayerById.set(zone.id, layer);
  }

  toggleColorPicker(): void {
    this.showColorPicker = !this.showColorPicker;
    this.showOpacitySlider = false;
  }

  toggleOpacitySlider(): void {
    this.showOpacitySlider = !this.showOpacitySlider;
    this.showColorPicker = false;
  }

  setColor(color: string): void {
    this.drawColor = color;
    const zone = this.selectedZone;
    if (zone) {
      zone.color = color;
      this.zoneLayerById.get(zone.id)?.setStyle({ color, fillColor: color });
    }
    this.showColorPicker = false;
  }

  setOpacity(value: number): void {
    this.drawOpacity = value;
    const zone = this.selectedZone;
    if (zone) {
      zone.opacity = value;
      this.zoneLayerById.get(zone.id)?.setStyle({ fillOpacity: value });
    }
  }

  deleteSelectedZone(): void {
    if (!this.selectedZoneId) return;
    this.zoneLayerById.get(this.selectedZoneId)?.remove();
    this.zoneLayerById.delete(this.selectedZoneId);
    this.drawnZones = this.drawnZones.filter((zone) => zone.id !== this.selectedZoneId);

    this.sensors
      .filter((sensor) => sensor.zoneId === this.selectedZoneId)
      .forEach((sensor) => this.removeSensorLayer(sensor.id));
    this.sensors = this.sensors.filter((sensor) => sensor.zoneId !== this.selectedZoneId);

    this.zoneDeleted.emit(this.selectedZoneId);
    if (this.isPlacingSensor) this.stopPlacingSensors();
    this.selectedZoneId = null;
  }

  // ===== Place sensors inside a drawn zone =====

  toggleAddSensor(): void {
    if (!this.map || !this.selectedZoneId) return;
    if (this.isPlacingSensor) {
      this.stopPlacingSensors();
      return;
    }
    this.isDrawing = false;
    this.stopDrawListening();
    this.showColorPicker = false;
    this.showOpacitySlider = false;
    this.isPlacingSensor = true;
    this.map.on('click', this.handleSensorClick);
  }

  private stopPlacingSensors(): void {
    if (!this.isPlacingSensor) return;
    this.isPlacingSensor = false;
    this.map?.off('click', this.handleSensorClick);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleSensorClick = (e: any): void => {
    this.tryAddSensorAt(e.latlng, this.selectedZoneId);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private tryAddSensorAt(latlng: any, targetZoneId: string | null): void {
    const zone = this.drawnZones.find((z) => z.id === targetZoneId);
    if (!zone || !this.isPointInPolygon(latlng, zone.latlngs)) return;

    const sensor: ZoneSensor = {
      id: crypto.randomUUID(),
      zoneId: zone.id,
      lat: latlng.lat,
      lng: latlng.lng,
    };
    this.sensors = [...this.sensors, sensor];
    this.renderSensor(sensor);
    this.sensorAdded.emit(sensor);
  }

  private isPointInPolygon(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    latlng: any,
    polygon: { lat: number; lng: number }[],
  ): boolean {
    const x = latlng.lng;
    const y = latlng.lat;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lng;
      const yi = polygon[i].lat;
      const xj = polygon[j].lng;
      const yj = polygon[j].lat;
      const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersects) inside = !inside;
    }
    return inside;
  }

  private renderSensor(sensor: ZoneSensor): void {
    const L = this.L;
    this.sensorLayer ??= L.layerGroup().addTo(this.map);

    const icon = L.divIcon({
      className: 'sensor-marker-icon',
      html: this.buildSensorSvg(),
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
    const marker = L.marker([sensor.lat, sensor.lng], { icon }).addTo(this.sensorLayer);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    marker.on('click', (evt: any) => {
      L.DomEvent.stopPropagation(evt);
      this.removeSensorLayer(sensor.id);
      this.sensors = this.sensors.filter((s) => s.id !== sensor.id);
      this.sensorRemoved.emit(sensor.id);
    });

    this.sensorMarkerById.set(sensor.id, marker);
  }

  private removeSensorLayer(sensorId: string): void {
    this.sensorMarkerById.get(sensorId)?.remove();
    this.sensorMarkerById.delete(sensorId);
  }

  private buildSensorSvg(): string {
    return `<div class="sensor-marker-badge">
      <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="12" height="12">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
        <path d="M3.27 6.96 12 12.01l8.73-5.05"></path>
        <path d="M12 22.08V12"></path>
      </svg>
    </div>`;
  }
}