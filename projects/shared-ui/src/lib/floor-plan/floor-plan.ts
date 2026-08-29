import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FloorPlanZoneInput {
  id: string;
  name: string;
  color: string;
  lat: number;
  lng: number;
}

export interface FloorPlanPin {
  left: number;
  top: number;
  color: string;
  label: string;
}

export interface DrawPoint {
  x: number;
  y: number;
}

export interface DrawnZone {
  id: string;
  points: DrawPoint[];
  color: string;
  opacity: number;
  assets: string[];
}

const DEFAULT_ZONE_COLOR = '#5b3df5';

/**
 * A static floor-plan image with real-zone pins overlaid, plus tools to draw
 * ad-hoc zones on top of it and attach one or more assets to each drawn zone.
 * Used wherever a floor's image-based view is shown (Projects config, Locating).
 */
@Component({
  standalone: true,
  selector: 'app-floor-plan',
  imports: [CommonModule, FormsModule],
  templateUrl: './floor-plan.html',
  styleUrls: ['./floor-plan.css'],
})
export class FloorPlanComponent implements OnChanges {
  @Input() image = 'mapp.png';
  /** Identifies the floor being displayed; drawn zones are kept separate per floor,
   *  and changing this resets zoom/pan/draw state (mirrors switching floors). */
  @Input() floorId: string | null = null;
  @Input() zones: FloorPlanZoneInput[] = [];

  get floorPlanPins(): FloorPlanPin[] {
    if (this.zones.length === 0) return [];

    const lats = this.zones.map((zone) => zone.lat);
    const lngs = this.zones.map((zone) => zone.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latRange = maxLat - minLat || 1;
    const lngRange = maxLng - minLng || 1;

    return this.zones.map((zone) => ({
      left: 10 + ((zone.lng - minLng) / lngRange) * 80,
      top: 10 + ((maxLat - zone.lat) / latRange) * 80,
      color: zone.color,
      label: zone.name,
    }));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['floorId'] && !changes['floorId'].firstChange) {
      this.resetFloorPlanTools();
    }
  }

  // ===== Zoom / pan =====

  readonly minZoom = 1;
  readonly maxZoom = 3;
  zoomLevel = 1;
  panX = 0;
  panY = 0;
  isPanning = false;

  @ViewChild('floorPlanCanvas') floorPlanCanvasRef?: ElementRef<HTMLElement>;

  private dragMoved = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private panStartX = 0;
  private panStartY = 0;

  startPan(event: MouseEvent): void {
    if (this.isDrawing || this.zoomLevel <= this.minZoom) return;
    event.preventDefault();
    this.isPanning = true;
    this.dragMoved = false;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.panStartX = this.panX;
    this.panStartY = this.panY;
  }

  @HostListener('document:mousemove', ['$event'])
  onDocumentMouseMove(event: MouseEvent): void {
    if (!this.isPanning) return;
    const dx = event.clientX - this.dragStartX;
    const dy = event.clientY - this.dragStartY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) this.dragMoved = true;
    if (!this.dragMoved) return;

    const rect = this.floorPlanCanvasRef?.nativeElement.getBoundingClientRect();
    if (!rect) return;
    const maxPanX = ((this.zoomLevel - 1) / 2) * rect.width;
    const maxPanY = ((this.zoomLevel - 1) / 2) * rect.height;
    this.panX = this.clamp(this.panStartX + dx, -maxPanX, maxPanX);
    this.panY = this.clamp(this.panStartY + dy, -maxPanY, maxPanY);
  }

  @HostListener('document:mouseup')
  onDocumentMouseUp(): void {
    this.isPanning = false;
  }

  zoomIn(): void {
    this.zoomLevel = Math.min(this.maxZoom, +(this.zoomLevel + 0.25).toFixed(2));
    this.clampPanToZoom();
  }

  zoomOut(): void {
    this.zoomLevel = Math.max(this.minZoom, +(this.zoomLevel - 0.25).toFixed(2));
    this.clampPanToZoom();
  }

  private clampPanToZoom(): void {
    const rect = this.floorPlanCanvasRef?.nativeElement.getBoundingClientRect();
    if (!rect) return;
    const maxPanX = ((this.zoomLevel - 1) / 2) * rect.width;
    const maxPanY = ((this.zoomLevel - 1) / 2) * rect.height;
    this.panX = this.clamp(this.panX, -maxPanX, maxPanX);
    this.panY = this.clamp(this.panY, -maxPanY, maxPanY);
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }

  private clampPct(value: number): number {
    return this.clamp(value, 0, 100);
  }

  // ===== Draw zones on the image =====

  isDrawing = false;
  drawingPoints: DrawPoint[] = [];
  drawColor = DEFAULT_ZONE_COLOR;
  drawOpacity = 0.55;

  /** Opacity of the floor plan image itself — useful for seeing zones/pins more
   *  clearly against a faded background. Adjusted by the same opacity slider when
   *  no zone is selected; adjusting a selected zone's fill takes over otherwise. */
  imageOpacity = 1;

  selectedZoneId: string | null = null;
  showOpacitySlider = false;

  private drawnZonesByFloor = new Map<string, DrawnZone[]>();

  get drawnZones(): DrawnZone[] {
    return this.floorId ? this.drawnZonesByFloor.get(this.floorId) ?? [] : [];
  }

  get selectedZone(): DrawnZone | null {
    return this.drawnZones.find((zone) => zone.id === this.selectedZoneId) ?? null;
  }

  get drawingPreviewPoints(): string {
    return this.drawingPoints.map((p) => `${p.x},${p.y}`).join(' ');
  }

  polygonPoints(zone: DrawnZone): string {
    return zone.points.map((p) => `${p.x},${p.y}`).join(' ');
  }

  toggleDraw(): void {
    this.isDrawing = !this.isDrawing;
    this.drawingPoints = [];
    this.selectedZoneId = null;
    this.showOpacitySlider = false;
  }

  onFloorPlanClick(event: MouseEvent): void {
    if (this.dragMoved) {
      this.dragMoved = false;
      return;
    }
    if (!this.isDrawing) return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const fx = (event.clientX - rect.left) / rect.width;
    const fy = (event.clientY - rect.top) / rect.height;
    // The image layer is panned/scaled independently of this (unscaled) container,
    // so undo that transform to recover the point's position on the base image.
    const x = this.clampPct((0.5 + (fx - 0.5 - this.panX / rect.width) / this.zoomLevel) * 100);
    const y = this.clampPct((0.5 + (fy - 0.5 - this.panY / rect.height) / this.zoomLevel) * 100);
    this.drawingPoints = [...this.drawingPoints, { x, y }];
  }

  onFloorPlanDblClick(event: MouseEvent): void {
    event.preventDefault();
    if (!this.isDrawing || this.drawingPoints.length < 3) return;
    if (!this.floorId) return;

    const zone: DrawnZone = {
      id: crypto.randomUUID(),
      points: this.drawingPoints,
      color: this.drawColor,
      opacity: this.drawOpacity,
      assets: [],
    };
    this.drawnZonesByFloor.set(this.floorId, [...(this.drawnZonesByFloor.get(this.floorId) ?? []), zone]);

    this.drawingPoints = [];
    this.isDrawing = false;
    this.selectedZoneId = zone.id;
    this.openAssetPanel(zone);
  }

  centroidX(zone: DrawnZone): number {
    return zone.points.reduce((sum, p) => sum + p.x, 0) / zone.points.length;
  }

  centroidY(zone: DrawnZone): number {
    return zone.points.reduce((sum, p) => sum + p.y, 0) / zone.points.length;
  }

  selectZone(zone: DrawnZone, event?: Event): void {
    event?.stopPropagation();
    if (this.isDrawing) return;
    this.selectedZoneId = this.selectedZoneId === zone.id ? null : zone.id;
    this.showOpacitySlider = false;
  }

  deleteSelectedZone(): void {
    if (!this.floorId || !this.selectedZoneId) return;
    const remaining = this.drawnZones.filter((zone) => zone.id !== this.selectedZoneId);
    this.drawnZonesByFloor.set(this.floorId, remaining);
    if (this.assetPanelZoneId === this.selectedZoneId) this.closeAssetPanel();
    this.selectedZoneId = null;
  }

  toggleOpacitySlider(): void {
    this.showOpacitySlider = !this.showOpacitySlider;
  }

  setColor(color: string): void {
    this.drawColor = color;
    const zone = this.selectedZone;
    if (zone) zone.color = color;
  }

  setOpacity(value: number): void {
    const zone = this.selectedZone;
    if (zone) {
      zone.opacity = value;
      this.drawOpacity = value;
    } else {
      this.imageOpacity = value;
    }
  }

  // ===== Assets inside a marked zone =====

  assetPanelZoneId: string | null = null;
  newAssetName = '';

  get assetPanelZone(): DrawnZone | null {
    return this.drawnZones.find((zone) => zone.id === this.assetPanelZoneId) ?? null;
  }

  openAssetPanel(zone: DrawnZone, event?: Event): void {
    event?.stopPropagation();
    this.assetPanelZoneId = this.assetPanelZoneId === zone.id ? null : zone.id;
    this.newAssetName = '';
  }

  closeAssetPanel(): void {
    this.assetPanelZoneId = null;
    this.newAssetName = '';
  }

  addAsset(): void {
    const zone = this.assetPanelZone;
    const name = this.newAssetName.trim();
    if (!zone || !name) return;
    zone.assets = [...zone.assets, name];
    this.newAssetName = '';
  }

  removeAsset(zone: DrawnZone, index: number): void {
    zone.assets = zone.assets.filter((_, i) => i !== index);
  }

  private resetFloorPlanTools(): void {
    this.isDrawing = false;
    this.drawingPoints = [];
    this.selectedZoneId = null;
    this.showOpacitySlider = false;
    this.zoomLevel = 1;
    this.panX = 0;
    this.panY = 0;
    this.isPanning = false;
    this.assetPanelZoneId = null;
    this.newAssetName = '';
    this.imageOpacity = 1;
  }
}
