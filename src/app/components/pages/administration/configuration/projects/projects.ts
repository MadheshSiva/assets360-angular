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
  Floor,
  HierarchyNode,
  MapComponent,
  MapPin,
  Project,
  ProjectStatus,
  SiteHierarchyService,
  areaAllowsBuildings,
  areaAllowsDirectZones,
} from 'shared-ui';

export interface AddProjectForm {
  name: string;
  description: string;
  weekStart: string;
  weekEnd: string;
  status: ProjectStatus;
}

type ChildModalKind = 'area' | 'building' | 'floor' | 'zone';

interface ChildModalState {
  kind: ChildModalKind;
  parentId: string;
  /** Only relevant when kind === 'zone': a zone can attach to either an area or a floor. */
  zoneParentKind?: 'area' | 'floor';
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
  imports: [CommonModule, FormsModule, MapComponent],
  templateUrl: './projects.html',
  styleUrls: ['./projects.css'],
})
export class Projects {
  private readonly hierarchy = inject(SiteHierarchyService);

  readonly projects = this.hierarchy.projects;
  readonly areaTypeLabels = AREA_TYPE_LABELS;
  readonly areaTypeShortLabels = AREA_TYPE_SHORT_LABELS;
  readonly zoneColors = ZONE_COLORS;

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
    return node.kind === 'area' ? node.type : null;
  }

  canAddZone(node: HierarchyNode): boolean {
    return node.kind === 'area' ? areaAllowsDirectZones(node.type) : node.kind === 'floor';
  }

  canAddBuilding(node: HierarchyNode): boolean {
    return node.kind === 'area' && areaAllowsBuildings(node.type);
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

  // ===== Add Area / Building / Floor / Zone modal (shared) =====

  childModal: ChildModalState | null = null;
  childFormName = '';
  childFormAreaType: AreaType = 'indoor';
  childFormZoneColor = ZONE_COLORS[0].value;
  childFormError: string | null = null;

  get childModalTitle(): string {
    switch (this.childModal?.kind) {
      case 'area':
        return 'Add Area';
      case 'building':
        return 'Add Building';
      case 'floor':
        return 'Add Floor';
      case 'zone':
        return 'Add Zone';
      default:
        return '';
    }
  }

  openAddArea(project: Project, event?: Event): void {
    event?.stopPropagation();
    this.childModal = { kind: 'area', parentId: project.id };
    this.resetChildForm();
  }

  openAddBuilding(area: Area, event?: Event): void {
    event?.stopPropagation();
    this.childModal = { kind: 'building', parentId: area.id };
    this.resetChildForm();
  }

  openAddFloor(building: Building, event?: Event): void {
    event?.stopPropagation();
    this.childModal = { kind: 'floor', parentId: building.id };
    this.resetChildForm();
  }

  openAddZone(parent: Area | Floor, event?: Event): void {
    event?.stopPropagation();
    this.childModal = { kind: 'zone', parentId: parent.id, zoneParentKind: parent.kind };
    this.resetChildForm();
  }

  private resetChildForm(): void {
    this.childFormName = '';
    this.childFormAreaType = 'indoor';
    this.childFormZoneColor = ZONE_COLORS[0].value;
    this.childFormError = null;
  }

  closeChildModal(): void {
    this.childModal = null;
  }

  submitChildModal(): void {
    if (!this.childModal) return;
    const name = this.childFormName.trim();
    if (!name) {
      this.childFormError = 'Name is required.';
      return;
    }

    let created: HierarchyNode | undefined;
    switch (this.childModal.kind) {
      case 'area':
        created = this.hierarchy.addArea(this.childModal.parentId, {
          name,
          type: this.childFormAreaType,
        });
        break;
      case 'building':
        created = this.hierarchy.addBuilding(this.childModal.parentId, { name });
        break;
      case 'floor':
        created = this.hierarchy.addFloor(this.childModal.parentId, { name });
        break;
      case 'zone':
        created =
          this.childModal.zoneParentKind === 'area'
            ? this.hierarchy.addZoneToArea(this.childModal.parentId, {
                name,
                color: this.childFormZoneColor,
              })
            : this.hierarchy.addZoneToFloor(this.childModal.parentId, {
                name,
                color: this.childFormZoneColor,
              });
        break;
    }

    if (!created) {
      this.childFormError = 'Could not add this item.';
      return;
    }

    this.expanded = new Set(this.expanded).add(this.childModal.parentId);
    this.childModal = null;
    this.activeNodeId = created.id;
    this.mapComponent?.flyTo(created.coords);
  }
}
