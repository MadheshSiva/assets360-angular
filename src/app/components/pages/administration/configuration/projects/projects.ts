import { Component, ViewChild, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AREA_TYPE_LABELS,
  AREA_TYPE_SHORT_LABELS,
  Area,
  AreaType,
  Building,
  childrenOf,
  Coords,
  Floor,
  FloorPlanComponent,
  FloorPlanZoneInput,
  HierarchyNode,
  MapComponent,
  MapLocation,
  MapPin,
  Project,
  ProjectStatus,
  SiteHierarchyService,
  State,
  Zone,
  areaAllowsBuildings,
  areaAllowsDirectZones,
} from 'shared-ui';
import { COUNTRIES, TIME_ZONES } from './country-data';

export interface AddProjectForm {
  name: string;
  description: string;
  weekStart: string;
  weekEnd: string;
  status: ProjectStatus;
}

type ChildModalKind = 'area' | 'state' | 'building' | 'floor' | 'zone';

interface ChildModalState {
  kind: ChildModalKind;
  parentId: string;
  /** Only relevant when kind === 'zone': a zone can attach to a state, a floor, or another zone (a sub-zone). */
  zoneParentKind?: 'state' | 'floor' | 'zone';
}

interface Row {
  node: HierarchyNode;
  depth: number;
}

const ZONE_COLORS = [
  { label: 'Purple', value: '#5b3df5' },
  { label: 'Red', value: '#c22a3e' },
  { label: 'Green', value: '#158b4b' },
  { label: 'Amber', value: '#a8650a' },
  { label: 'Blue', value: '#2563eb' },
];

@Component({
  standalone: true,
  selector: 'app-projects',
  imports: [CommonModule, FormsModule, MapComponent, FloorPlanComponent],
  templateUrl: './projects.html',
  styleUrls: ['./projects.css'],
})
export class Projects {
  private readonly hierarchy = inject(SiteHierarchyService);

  readonly projects = this.hierarchy.projects;
  readonly areaTypeLabels = AREA_TYPE_LABELS;
  readonly areaTypeShortLabels = AREA_TYPE_SHORT_LABELS;
  readonly zoneColors = ZONE_COLORS;

  /** Everything starts collapsed — only the top-level project(s) show at first, and each
   *  click reveals just that node's own children, one level at a time. */
  expanded = new Set<string>();
  activeNodeId: string | null = null;

  editingId: string | null = null;
  editingValue = '';

  @ViewChild(MapComponent, { static: false }) mapComponent?: MapComponent;

  readonly mapPins = computed<MapPin[]>(() =>
    this.hierarchy.allZones().map((zone) => ({
      lat: zone.coords.lat,
      lng: zone.coords.lng,
      color: zone.color,
      label: zone.name,
    })),
  );

  /** Gives the map something to center on even before any zone exists to derive a pin from —
   *  otherwise it never initializes (see MapComponent.ngAfterViewInit). */
  readonly mapLocations = computed<MapLocation[]>(() => {
    const project = this.projects()[0];
    return project ? [{ name: project.name, coords: project.coords }] : [];
  });

  /** The floor plan image is shown instead of the geo map when a floor,
   *  or a zone that belongs to a floor, is the active node. */
  get activeFloor(): Floor | null {
    const node = this.findNode(this.activeNodeId);
    if (!node) return null;
    if (node.kind === 'floor') return node;
    if (node.kind === 'zone') return this.findParentFloor(node.id) ?? null;
    return null;
  }

  get showFloorPlan(): boolean {
    return this.activeFloor !== null;
  }

  /** When the active node is a zone with an uploaded map image, that image is shown in the
   *  map panel instead of the geo map or the floor plan. A sub-zone with no image of its own
   *  falls back to its parent zone's image, since it's just an area within that same zone. */
  get activeZoneImage(): string | null {
    const node = this.findNode(this.activeNodeId);
    if (!node || node.kind !== 'zone') return null;
    if (node.mapImage) return node.mapImage;
    return this.findParentZone(node.id)?.mapImage ?? null;
  }

  get floorPlanZones(): FloorPlanZoneInput[] {
    return (this.activeFloor?.zones ?? []).map((zone) => ({
      id: zone.id,
      name: zone.name,
      color: zone.color,
      lat: zone.coords.lat,
      lng: zone.coords.lng,
    }));
  }

  private findNode(id: string | null): HierarchyNode | undefined {
    if (!id) return undefined;
    let found: HierarchyNode | undefined;
    const walk = (node: HierarchyNode) => {
      if (found) return;
      if (node.id === id) {
        found = node;
        return;
      }
      childrenOf(node).forEach(walk);
    };
    this.projects().forEach(walk);
    return found;
  }

  /** Walks a zone's own sub-zones (recursively) to see if the target zone is anywhere underneath it. */
  private zoneContains(zone: Zone, zoneId: string): boolean {
    return zone.zones.some((sub) => sub.id === zoneId || this.zoneContains(sub, zoneId));
  }

  private findParentFloor(zoneId: string): Floor | undefined {
    let result: Floor | undefined;
    const walk = (node: HierarchyNode) => {
      if (result) return;
      // Match a zone directly on this floor, or a sub-zone nested inside one of those zones.
      if (node.kind === 'floor' && node.zones.some((zone) => zone.id === zoneId || this.zoneContains(zone, zoneId))) {
        result = node;
        return;
      }
      childrenOf(node).forEach(walk);
    };
    this.projects().forEach(walk);
    return result;
  }

  /** The zone this one is nested under, if it's a sub-zone (nesting is one level deep only). */
  private findParentZone(zoneId: string): Zone | undefined {
    let result: Zone | undefined;
    const walk = (node: HierarchyNode) => {
      if (result) return;
      if (node.kind === 'zone' && node.zones.some((z) => z.id === zoneId)) {
        result = node;
        return;
      }
      childrenOf(node).forEach(walk);
    };
    this.projects().forEach(walk);
    return result;
  }

  get visibleRows(): Row[] {
    const rows: Row[] = [];
    const walk = (node: HierarchyNode, depth: number) => {
      rows.push({ node, depth });
      if (this.expanded.has(node.id)) {
        childrenOf(node).forEach((child) => walk(child, depth + 1));
      }
    };
    this.projects().forEach((project) => walk(project, 0));
    return rows;
  }

  trackByRow = (_: number, row: Row) => row.node.id;

  isActive(id: string): boolean {
    return this.activeNodeId === id;
  }

  isExpandable(node: HierarchyNode): boolean {
    return childrenOf(node).length > 0 && !this.expanded.has(node.id);
  }

  areaTypeOf(node: HierarchyNode): AreaType | null {
    return node.kind === 'state' ? node.type : null;
  }

  canAddZone(node: HierarchyNode): boolean {
    return node.kind === 'state' ? areaAllowsDirectZones(node.type) : node.kind === 'floor';
  }

  canAddBuilding(node: HierarchyNode): boolean {
    return node.kind === 'state' && areaAllowsBuildings(node.type);
  }

  /** A zone can add sub-zones, but a sub-zone itself cannot — nesting stops at one level. */
  canAddSubZone(node: HierarchyNode): boolean {
    return node.kind === 'zone' && !this.findParentZone(node.id);
  }

  toggle(node: HierarchyNode): void {
    this.activeNodeId = node.id;
    this.mapComponent?.flyTo(node.coords);

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

  // ===== Inline rename =====

  startEdit(node: HierarchyNode, event?: Event): void {
    event?.stopPropagation();
    this.editingId = node.id;
    this.editingValue = node.name;
  }

  commitEdit(): void {
    if (this.editingId === null) return;
    const newName = this.editingValue.trim();
    if (newName) {
      this.hierarchy.rename(this.editingId, newName);
    }
    this.cancelEdit();
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editingValue = '';
  }

  // ===== Delete =====

  deleteNode(node: HierarchyNode, event?: Event): void {
    event?.stopPropagation();
    const confirmed = window.confirm(`Delete "${node.name}" and everything under it?`);
    if (!confirmed) return;

    const deleted = this.hierarchy.deleteNode(node.id);
    if (!deleted) {
      window.alert('At least one project must remain.');
      return;
    }

    if (this.activeNodeId === node.id) this.activeNodeId = null;
    if (this.editingId === node.id) this.cancelEdit();
  }

  // ===== Add Project modal =====

  isAddProjectOpen = false;
  addProjectForm: AddProjectForm = this.emptyAddProjectForm();
  addProjectError: string | null = null;

  private emptyAddProjectForm(): AddProjectForm {
    return { name: '', description: '', weekStart: '', weekEnd: '', status: 'active' };
  }

  openAddProject(): void {
    this.addProjectForm = this.emptyAddProjectForm();
    this.addProjectError = null;
    this.isAddProjectOpen = true;
  }

  closeAddProject(): void {
    this.isAddProjectOpen = false;
  }

  toggleAddProjectStatus(): void {
    this.addProjectForm.status = this.addProjectForm.status === 'active' ? 'inactive' : 'active';
  }

  submitAddProject(): void {
    const name = this.addProjectForm.name.trim();
    if (!name) {
      this.addProjectError = 'Project name is required.';
      return;
    }
    if (
      this.addProjectForm.weekStart &&
      this.addProjectForm.weekEnd &&
      this.addProjectForm.weekStart > this.addProjectForm.weekEnd
    ) {
      this.addProjectError = 'Week end must be on or after week start.';
      return;
    }

    const project = this.hierarchy.addProject({
      name,
      description: this.addProjectForm.description.trim(),
      weekStart: this.addProjectForm.weekStart,
      weekEnd: this.addProjectForm.weekEnd,
      status: this.addProjectForm.status,
    });

    this.isAddProjectOpen = false;
    this.activeNodeId = project.id;
    this.mapComponent?.flyTo(project.coords);
  }

  // ===== Add Area / State / Building / Floor / Zone modal (shared) =====

  readonly countryOptions = COUNTRIES;
  readonly timeZoneOptions = TIME_ZONES;

  childModal: ChildModalState | null = null;
  childFormName = '';
  childFormZoneColor = ZONE_COLORS[0].value;
  childFormDescription = '';
  childFormTimeZone = '';
  childFormCountryCode = '';
  childFormLatitude = '';
  childFormLongitude = '';
  childFormZoomLevel = '';
  childFormStatus: 'active' | 'inactive' = 'active';
  childFormStateType: AreaType | '' = '';
  childFormMapImage: string | null = null;
  childFormMapFileName: string | null = null;
  childFormTopZone = '';
  childFormPriority = '';
  childFormExit = '';
  childFormAssemblyPoint: 'active' | 'inactive' = 'active';
  childFormError: string | null = null;

  get childModalTitle(): string {
    switch (this.childModal?.kind) {
      case 'area':
        return 'Add Country';
      case 'state':
        return 'Add Area';
      case 'building':
        return 'Add Building';
      case 'floor':
        return 'Add Floor';
      case 'zone':
        return this.childModal?.zoneParentKind === 'zone' ? 'Add Subzone' : 'Add Zone';
      default:
        return '';
    }
  }

  get childModalSubmitLabel(): string {
    switch (this.childModal?.kind) {
      case 'area':
        return 'Add Country';
      case 'state':
        return 'Add State';
      case 'building':
        return 'Add City';
      case 'floor':
        return 'Add Street';
      case 'zone':
        return this.childModal?.zoneParentKind === 'zone' ? 'Add Subzone' : 'Add Building';
      default:
        return 'Create';
    }
  }

  /** Countries (areas) already added under the project currently open in the "Add Country" modal. */
  get countryListRows(): Area[] {
    if (!this.childModal || this.childModal.kind !== 'area') return [];
    const parent = this.findNode(this.childModal.parentId);
    return parent && parent.kind === 'project' ? parent.areas : [];
  }

  /** States already added under the country currently open in the "Add Area" modal. */
  get stateListRows(): State[] {
    if (!this.childModal || this.childModal.kind !== 'state') return [];
    const parent = this.findNode(this.childModal.parentId);
    return parent && parent.kind === 'area' ? parent.states : [];
  }

  /** Buildings ("cities") already added under the area currently open in the "Add Building" modal. */
  get buildingListRows(): Building[] {
    if (!this.childModal || this.childModal.kind !== 'building') return [];
    const parent = this.findNode(this.childModal.parentId);
    return parent && parent.kind === 'state' ? parent.buildings : [];
  }

  /** Floors ("streets") already added under the building currently open in the "Add Floor" modal. */
  get floorListRows(): Floor[] {
    if (!this.childModal || this.childModal.kind !== 'floor') return [];
    const parent = this.findNode(this.childModal.parentId);
    return parent && parent.kind === 'building' ? parent.floors : [];
  }

  /** Zones already added under the state/floor/zone currently open in the "Add Zone" modal. */
  get zoneListRows(): Zone[] {
    if (!this.childModal || this.childModal.kind !== 'zone') return [];
    const parent = this.findNode(this.childModal.parentId);
    return parent && (parent.kind === 'state' || parent.kind === 'floor' || parent.kind === 'zone')
      ? parent.zones
      : [];
  }

  openAddArea(project: Project, event?: Event): void {
    event?.stopPropagation();
    this.childModal = { kind: 'area', parentId: project.id };
    this.resetChildForm();
  }

  openAddState(area: Area, event?: Event): void {
    event?.stopPropagation();
    this.childModal = { kind: 'state', parentId: area.id };
    this.resetChildForm();
  }

  openAddBuilding(state: State, event?: Event): void {
    event?.stopPropagation();
    this.childModal = { kind: 'building', parentId: state.id };
    this.resetChildForm();
  }

  openAddFloor(building: Building, event?: Event): void {
    event?.stopPropagation();
    this.childModal = { kind: 'floor', parentId: building.id };
    this.resetChildForm();
  }

  openAddZone(parent: State | Floor | Zone, event?: Event): void {
    event?.stopPropagation();
    this.childModal = { kind: 'zone', parentId: parent.id, zoneParentKind: parent.kind };
    this.resetChildForm();
  }

  private resetChildForm(): void {
    this.childFormName = '';
    this.childFormZoneColor = ZONE_COLORS[0].value;
    this.childFormDescription = '';
    this.childFormTimeZone = '';
    this.childFormCountryCode = '';
    this.childFormLatitude = '';
    this.childFormLongitude = '';
    this.childFormZoomLevel = '';
    this.childFormStatus = 'active';
    this.childFormStateType = '';
    this.childFormMapImage = null;
    this.childFormMapFileName = null;
    this.childFormTopZone = '';
    this.childFormPriority = '';
    this.childFormExit = '';
    this.childFormAssemblyPoint = 'active';
    this.childFormError = null;
  }

  closeChildModal(): void {
    this.childModal = null;
  }

  onMapFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.childFormMapFileName = file.name;
    const reader = new FileReader();
    reader.onload = () => {
      this.childFormMapImage = typeof reader.result === 'string' ? reader.result : null;
    };
    reader.readAsDataURL(file);
  }

  onCountryNameChange(): void {
    const match = this.countryOptions.find((c) => c.name === this.childFormName);
    this.childFormCountryCode = match?.code ?? '';
  }

  toggleChildFormStatus(): void {
    this.childFormStatus = this.childFormStatus === 'active' ? 'inactive' : 'active';
  }

  toggleChildFormAssemblyPoint(): void {
    this.childFormAssemblyPoint = this.childFormAssemblyPoint === 'active' ? 'inactive' : 'active';
  }

  submitChildModal(): void {
    if (!this.childModal) return;

    if (this.childModal.kind === 'area') {
      this.submitAddCountry();
      return;
    }
    if (this.childModal.kind === 'state') {
      this.submitAddState();
      return;
    }
    if (this.childModal.kind === 'building') {
      this.submitAddBuilding();
      return;
    }
    if (this.childModal.kind === 'floor') {
      this.submitAddFloor();
      return;
    }

    this.submitAddZone();
  }

  /** Adding a country keeps the modal open so several can be added in one session. */
  private submitAddCountry(): void {
    if (!this.childModal) return;
    const name = this.childFormName.trim();
    if (!name) {
      this.childFormError = 'Country name is required.';
      return;
    }
    const timeZone = this.childFormTimeZone.trim();
    if (!timeZone) {
      this.childFormError = 'Time zone is required.';
      return;
    }

    const lat = parseFloat(this.childFormLatitude);
    const lng = parseFloat(this.childFormLongitude);
    const zoom = parseFloat(this.childFormZoomLevel);
    const coords: Coords | undefined =
      !isNaN(lat) && !isNaN(lng) ? { lat, lng, zoom: !isNaN(zoom) ? zoom : 12 } : undefined;

    const created = this.hierarchy.addArea(this.childModal.parentId, {
      name,
      description: this.childFormDescription.trim(),
      timeZone,
      countryCode: this.childFormCountryCode,
      status: this.childFormStatus,
      coords,
    });

    if (!created) {
      this.childFormError = 'Could not add this country.';
      return;
    }

    this.expanded = new Set(this.expanded).add(this.childModal.parentId);
    this.activeNodeId = created.id;
    this.mapComponent?.flyTo(created.coords);
    this.resetChildForm();
  }

  /** Adding a state keeps the modal open so several can be added in one session. */
  private submitAddState(): void {
    if (!this.childModal) return;
    const name = this.childFormName.trim();
    if (!name) {
      this.childFormError = 'Area name is required.';
      return;
    }
    if (!this.childFormStateType) {
      this.childFormError = 'Outdoor map type is required.';
      return;
    }

    const lat = parseFloat(this.childFormLatitude);
    const lng = parseFloat(this.childFormLongitude);
    const zoom = parseFloat(this.childFormZoomLevel);
    const coords: Coords | undefined =
      !isNaN(lat) && !isNaN(lng) ? { lat, lng, zoom: !isNaN(zoom) ? zoom : 12 } : undefined;

    const created = this.hierarchy.addState(this.childModal.parentId, {
      name,
      type: this.childFormStateType,
      description: this.childFormDescription.trim(),
      status: this.childFormStatus,
      coords,
    });

    if (!created) {
      this.childFormError = 'Could not add this area.';
      return;
    }

    this.expanded = new Set(this.expanded).add(this.childModal.parentId);
    this.activeNodeId = created.id;
    this.mapComponent?.flyTo(created.coords);
    this.resetChildForm();
  }

  /** Adding a building ("city") keeps the modal open so several can be added in one session. */
  private submitAddBuilding(): void {
    if (!this.childModal) return;
    const name = this.childFormName.trim();
    if (!name) {
      this.childFormError = 'Building name is required.';
      return;
    }

    const lat = parseFloat(this.childFormLatitude);
    const lng = parseFloat(this.childFormLongitude);
    const zoom = parseFloat(this.childFormZoomLevel);
    const coords: Coords | undefined =
      !isNaN(lat) && !isNaN(lng) ? { lat, lng, zoom: !isNaN(zoom) ? zoom : 12 } : undefined;

    const created = this.hierarchy.addBuilding(this.childModal.parentId, {
      name,
      description: this.childFormDescription.trim(),
      status: this.childFormStatus,
      coords,
    });

    if (!created) {
      this.childFormError = 'Could not add this building.';
      return;
    }

    this.expanded = new Set(this.expanded).add(this.childModal.parentId);
    this.activeNodeId = created.id;
    this.mapComponent?.flyTo(created.coords);
    this.resetChildForm();
  }

  /** Adding a floor ("street") keeps the modal open so several can be added in one session. */
  private submitAddFloor(): void {
    if (!this.childModal) return;
    const name = this.childFormName.trim();
    if (!name) {
      this.childFormError = 'Floor name is required.';
      return;
    }

    const created = this.hierarchy.addFloor(this.childModal.parentId, {
      name,
      description: this.childFormDescription.trim(),
      mapImage: this.childFormMapImage ?? undefined,
      status: this.childFormStatus,
    });

    if (!created) {
      this.childFormError = 'Could not add this floor.';
      return;
    }

    this.expanded = new Set(this.expanded).add(this.childModal.parentId);
    this.activeNodeId = created.id;
    this.mapComponent?.flyTo(created.coords);
    this.resetChildForm();
  }

  /** Adding a zone keeps the modal open so several can be added in one session. */
  private submitAddZone(): void {
    if (!this.childModal) return;
    const name = this.childFormName.trim();
    if (!name) {
      this.childFormError = 'Name is required.';
      return;
    }

    const zoom = parseFloat(this.childFormZoomLevel);
    const input = {
      name,
      color: this.childFormZoneColor,
      description: this.childFormDescription.trim(),
      mapImage: this.childFormMapImage ?? undefined,
      topZone: this.childFormTopZone.trim(),
      priority: this.childFormPriority.trim(),
      exit: this.childFormExit.trim(),
      assemblyPoint: this.childFormAssemblyPoint,
      status: this.childFormStatus,
      coords: !isNaN(zoom) ? { ...this.jitteredParentCoords(), zoom } : undefined,
    };

    let created: Zone | undefined;
    if (this.childModal.zoneParentKind === 'state') {
      created = this.hierarchy.addZoneToState(this.childModal.parentId, input);
    } else if (this.childModal.zoneParentKind === 'zone') {
      created = this.hierarchy.addSubZone(this.childModal.parentId, input);
    } else {
      created = this.hierarchy.addZoneToFloor(this.childModal.parentId, input);
    }

    if (!created) {
      this.childFormError = 'Could not add this zone.';
      return;
    }

    this.expanded = new Set(this.expanded).add(this.childModal.parentId);
    this.activeNodeId = created.id;
    this.mapComponent?.flyTo(created.coords);
    this.resetChildForm();
  }

  /** The parent's own lat/lng, used as the base point when only a zoom level is given for a new zone. */
  private jitteredParentCoords(): Coords {
    const parent = this.childModal ? this.findNode(this.childModal.parentId) : undefined;
    return parent?.coords ?? { lat: 25.2048, lng: 55.2708, zoom: 12 };
  }
}
