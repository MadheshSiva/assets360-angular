import { Component, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AREA_TYPE_LABELS,
  AREA_TYPE_SHORT_LABELS,
  Coords,
  HierarchyNode,
  MapComponent,
  MapPin,
  SiteHierarchyService,
  childrenOf,
} from 'shared-ui';

export type TrackMode = 'people' | 'assets';
type Period = 'day' | 'week' | 'month';
type PopupKind = 'count' | 'device' | 'camera';

interface Row {
  node: HierarchyNode;
  depth: number;
}

interface MockItem {
  id: string;
  name: string;
  coords: Coords;
}

interface DeviceItem extends MockItem {
  battery: number;
  rssi: number;
  firmware: string;
  lastHeartbeat: string;
}

interface LevelFilters {
  period: Period;
  parameter: string;
  selectedItemIds: string[];
  deviceAttribute: string;
}

interface Popup {
  kind: PopupKind;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

const CATEGORY_PARAMETERS = new Set(['employee', 'asset', 'device']);

@Component({
  standalone: true,
  selector: 'app-locating',
  imports: [CommonModule, FormsModule, MapComponent],
  templateUrl: './locating.html',
  styleUrls: ['./locating.css'],
})
export class Locating {
  mode: TrackMode = 'people';
  isPanelCollapsed = false;

  constructor(private readonly hierarchy: SiteHierarchyService) {
    // Re-derive pins whenever the underlying (shared, signal-based) zone data changes.
    effect(() => {
      this.hierarchy.allZones();
      this.refreshPins();
    });
  }

  togglePanel(): void {
    this.isPanelCollapsed = !this.isPanelCollapsed;
  }

  // ===== Read-only cascade (mirrors the Area/Zone/Building hierarchy configured in Projects) =====

  expanded = new Set<string>();
  activeNodeId: string | null = null;

  @ViewChild(MapComponent, { static: false }) mapComponent?: MapComponent;

  readonly areaTypeLabels = AREA_TYPE_LABELS;
  readonly areaTypeShortLabels = AREA_TYPE_SHORT_LABELS;

  get visibleRows(): Row[] {
    const rows: Row[] = [];
    const walk = (node: HierarchyNode, depth: number) => {
      rows.push({ node, depth });
      if (this.expanded.has(node.id)) {
        childrenOf(node).forEach((child) => walk(child, depth + 1));
      }
    };
    this.hierarchy.projects().forEach((project) => walk(project, 0));
    return rows;
  }

  trackByRow = (_: number, row: Row) => row.node.id;

  isActive(id: string): boolean {
    return this.activeNodeId === id;
  }

  isExpandable(node: HierarchyNode): boolean {
    return childrenOf(node).length > 0 && !this.expanded.has(node.id);
  }

  areaTypeOf(node: HierarchyNode) {
    return node.kind === 'area' ? node.type : null;
  }

  toggle(node: HierarchyNode): void {
    this.activeNodeId = node.id;
    this.mapComponent?.flyTo(node.coords);
    this.refreshPins();

    if (this.expanded.has(node.id)) {
      const next = new Set(this.expanded);
      next.delete(node.id);
      const collectDescendants = (n: HierarchyNode) => {
        childrenOf(n).forEach((child) => {
          next.delete(child.id);
          collectDescendants(child);
        });
      };
      collectDescendants(node);
      this.expanded = next;
      return;
    }

    if (childrenOf(node).length === 0) return;
    this.expanded = new Set(this.expanded).add(node.id);
  }

  get activeNode(): HierarchyNode | undefined {
    return this.activeNodeId ? this.hierarchy.findNode(this.activeNodeId) : undefined;
  }

  /** Which per-level filter bar to show: the spec calls for filters at Area level and Floor level only. */
  get activeLevel(): 'area' | 'floor' | null {
    const kind = this.activeNode?.kind;
    return kind === 'area' ? 'area' : kind === 'floor' ? 'floor' : null;
  }

  get currentFilters(): LevelFilters | null {
    if (this.activeLevel === 'area') return this.areaFilters;
    if (this.activeLevel === 'floor') return this.floorFilters;
    return null;
  }

  // ===== Area-level & floor-level filters (independent state per level) =====

  private defaultFilters(): LevelFilters {
    return { period: 'month', parameter: '', selectedItemIds: [], deviceAttribute: '' };
  }

  areaFilters: LevelFilters = this.defaultFilters();
  floorFilters: LevelFilters = this.defaultFilters();

  parameters = [
    { label: 'Employee', value: 'employee' },
    { label: 'Asset', value: 'asset' },
    { label: 'Device', value: 'device' },
    { label: 'Heart Rate', value: 'heart_rate' },
    { label: 'Body Temperature', value: 'body_temperature' },
    { label: 'Location', value: 'location' },
    { label: 'Movement Status', value: 'movement' },
    { label: 'Battery Level', value: 'battery' },
  ];

  deviceAttributes = [
    { label: 'Battery', value: 'battery' },
    { label: 'RSSI', value: 'rssi' },
    { label: 'Firmware Version', value: 'firmware' },
    { label: 'Last Heartbeat', value: 'heartbeat' },
  ];

  selectPeriod(filters: LevelFilters, period: Period): void {
    filters.period = period;
  }

  onParameterChange(filters: LevelFilters): void {
    filters.selectedItemIds = [];
    filters.deviceAttribute = '';
    this.refreshPins();
  }

  hasCategoryItems(filters: LevelFilters | null): boolean {
    return !!filters && CATEGORY_PARAMETERS.has(filters.parameter);
  }

  isDeviceCategory(filters: LevelFilters | null): boolean {
    return filters?.parameter === 'device';
  }

  itemsForParameter(parameter: string): MockItem[] {
    switch (parameter) {
      case 'employee':
        return this.employeeItems;
      case 'asset':
        return this.assetItems;
      case 'device':
        return this.deviceItems;
      default:
        return [];
    }
  }

  toggleItemSelection(filters: LevelFilters, id: string): void {
    const idx = filters.selectedItemIds.indexOf(id);
    if (idx >= 0) filters.selectedItemIds.splice(idx, 1);
    else filters.selectedItemIds.push(id);
    this.refreshPins();
  }

  isItemSelected(filters: LevelFilters, id: string): boolean {
    return filters.selectedItemIds.includes(id);
  }

  onDeviceAttributeChange(): void {
    this.refreshPins();
  }

  // ===== Mock items (Employee / Asset / Device categories) =====

  employeeItems: MockItem[] = [
    { id: 'emp-1', name: 'John Doe', coords: { lat: 23.6138, lng: 58.5406, zoom: 19 } },
    { id: 'emp-2', name: 'Jane Smith', coords: { lat: 23.6149, lng: 58.5418, zoom: 19 } },
    { id: 'emp-3', name: 'Ali Hassan', coords: { lat: 23.6128, lng: 58.5395, zoom: 19 } },
  ];

  assetItems: MockItem[] = [
    { id: 'asset-1', name: 'Forklift #12', coords: { lat: 23.6135, lng: 58.5399, zoom: 19 } },
    { id: 'asset-2', name: 'Pallet Jack #04', coords: { lat: 23.6151, lng: 58.542, zoom: 19 } },
  ];

  deviceItems: DeviceItem[] = [
    {
      id: 'dev-1',
      name: 'Wearable Tag 101',
      coords: { lat: 23.6143, lng: 58.541, zoom: 19 },
      battery: 82,
      rssi: -61,
      firmware: '2.3.1',
      lastHeartbeat: '2 min ago',
    },
    {
      id: 'dev-2',
      name: 'Fixed Beacon B2',
      coords: { lat: 23.6146, lng: 58.5419, zoom: 19 },
      battery: 45,
      rssi: -74,
      firmware: '2.2.0',
      lastHeartbeat: '5 min ago',
    },
  ];

  cameraPins: MapPin[] = [
    {
      lat: 23.6136,
      lng: 58.5412,
      color: '#1e293b',
      label: 'Lobby Camera',
      kind: 'camera',
      payload: { id: 'cam-1', name: 'Lobby Camera', zoneName: 'Reception' },
    },
    {
      lat: 23.6126,
      lng: 58.5397,
      color: '#1e293b',
      label: 'Parking Camera',
      kind: 'camera',
      payload: { id: 'cam-2', name: 'Parking Camera', zoneName: 'Parking Zone' },
    },
  ];

  private deviceAttributeValue(device: DeviceItem, attribute: string): string {
    switch (attribute) {
      case 'battery':
        return `${device.battery}%`;
      case 'rssi':
        return `${device.rssi} dBm`;
      case 'firmware':
        return device.firmware;
      case 'heartbeat':
        return device.lastHeartbeat;
      default:
        return '';
    }
  }

  /** Zones from the real configured hierarchy, each doubling as a "count" marker on the map. */
  private zonePins(): MapPin[] {
    return this.hierarchy.allZones().map((zone, i) => ({
      lat: zone.coords.lat,
      lng: zone.coords.lng,
      color: zone.color,
      label: zone.name,
      kind: 'count' as const,
      payload: { zoneName: zone.name, items: this.mockTrackedItems(zone.name, i) },
    }));
  }

  private mockTrackedItems(zoneName: string, seed: number) {
    const statuses: Array<'online' | 'idle' | 'offline'> = ['online', 'idle', 'offline'];
    return Array.from({ length: 2 + (seed % 2) }, (_, i) => ({
      name: `Asset ${seed * 3 + i + 1}`,
      location: zoneName,
      status: statuses[(seed + i) % statuses.length],
    }));
  }

  private selectedItemPins(filters: LevelFilters | null): MapPin[] {
    if (!filters || !this.hasCategoryItems(filters)) return [];

    if (filters.parameter === 'device') {
      return this.deviceItems
        .filter((d) => filters.selectedItemIds.includes(d.id))
        .map((d) => ({
          lat: d.coords.lat,
          lng: d.coords.lng,
          color: '#2563eb',
          label: filters.deviceAttribute
            ? `${d.name} (${this.deviceAttributeValue(d, filters.deviceAttribute)})`
            : d.name,
          kind: 'device' as const,
          payload: {
            id: d.id,
            name: d.name,
            battery: d.battery,
            rssi: d.rssi,
            firmware: d.firmware,
            lastHeartbeat: d.lastHeartbeat,
          },
        }));
    }

    const items = this.itemsForParameter(filters.parameter);
    return items
      .filter((item) => filters.selectedItemIds.includes(item.id))
      .map((item) => ({ lat: item.coords.lat, lng: item.coords.lng, color: '#5b3df5', label: item.name }));
  }

  mapPins: MapPin[] = [];

  private refreshPins(): void {
    this.mapPins = [...this.zonePins(), ...this.selectedItemPins(this.currentFilters), ...this.cameraPins];
  }

  // ===== Click-to-popup =====

  activePopup: Popup | null = null;

  onPinClick(pin: MapPin): void {
    if (!pin.kind) return;
    this.activePopup = { kind: pin.kind, data: pin.payload };
  }

  closePopup(): void {
    this.activePopup = null;
  }

  // ===== Existing Statistics panel (unrelated to the spec changes above; left as-is) =====

  selectedPeriod: 'day' | 'week' | 'month' = 'month';
  isStatsModalOpen = false;

  stats = {
    topZone: 'Zone A',
    peakTime: '14:00',
    peakDay: 'Monday',
  };

  statOptions: { key: string; label: string; checked: boolean }[] = [
    { key: 'topZone', label: 'Top Zone', checked: true },
    { key: 'peakTime', label: 'Peak Time', checked: true },
    { key: 'peakDay', label: 'Peak Day', checked: true },
  ];

  selectStatsPeriod(period: 'day' | 'week' | 'month'): void {
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

  trackedPeople = [
    { name: 'Assets1', location: 'Azy floor - Room 101', status: 'online' as const },
    { name: 'Assets2', location: 'Azy floor - Room 102', status: 'online' as const },
    { name: 'Assets3', location: 'Azy floor - Room 103', status: 'idle' as const },
    { name: 'Assets4', location: 'Azy floor - Room 101', status: 'offline' as const },
  ];
}
