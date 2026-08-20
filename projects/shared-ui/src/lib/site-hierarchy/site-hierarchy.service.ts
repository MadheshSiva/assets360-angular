import { Injectable, computed, signal } from '@angular/core';
import {
  Area,
  AreaType,
  Building,
  Coords,
  Floor,
  HierarchyNode,
  Project,
  ProjectStatus,
  Zone,
  areaAllowsBuildings,
  areaAllowsDirectZones,
  childrenOf,
} from './site-hierarchy.model';

export interface AddProjectInput {
  name: string;
  description?: string;
  weekStart?: string;
  weekEnd?: string;
  status: ProjectStatus;
}

export interface AddAreaInput {
  name: string;
  type: AreaType;
}

export interface AddZoneInput {
  name: string;
  color: string;
}

export interface AddBuildingInput {
  name: string;
}

export interface AddFloorInput {
  name: string;
}

/**
 * Single source of truth for the Project -> Area -> (Zone and/or Building -> Floor -> Zone)
 * hierarchy. Projects (Administration -> Configuration) is the only consumer allowed to call
 * the mutators below; Locating reads `projects` only.
 */
@Injectable({ providedIn: 'root' })
export class SiteHierarchyService {
  private nextId = 1000;

  private readonly _projects = signal<Project[]>([this.seedProject()]);
  readonly projects = this._projects.asReadonly();
  readonly allZones = computed(() => this.flattenZones(this._projects()));

  private genId(prefix: string): string {
    return `${prefix}-${this.nextId++}`;
  }

  private jitteredCoords(base: Coords, zoomStep = 2): Coords {
    const jitter = () => (Math.random() - 0.5) * 0.01;
    return {
      lat: base.lat + jitter(),
      lng: base.lng + jitter(),
      zoom: Math.min(base.zoom + zoomStep, 20),
    };
  }

  private seedProject(): Project {
    const projectCoords: Coords = { lat: 23.612, lng: 58.539, zoom: 13 };
    const areaCoords: Coords = { lat: 23.6135, lng: 58.5405, zoom: 15 };
    const buildingCoords: Coords = { lat: 23.614, lng: 58.541, zoom: 17 };

    const zone = (id: string, name: string, color: string, coords: Coords): Zone => ({
      kind: 'zone',
      id,
      name,
      color,
      coords,
    });

    const floor1: Floor = {
      kind: 'floor',
      id: 'floor-1',
      name: 'Ground Floor',
      coords: { lat: 23.6141, lng: 58.5411, zoom: 18 },
      zones: [
        zone('zone-1', 'Reception', '#5b3df5', { lat: 23.6141, lng: 58.5408, zoom: 19 }),
        zone('zone-2', 'Server Room', '#c22a3e', { lat: 23.6144, lng: 58.5413, zoom: 19 }),
      ],
    };
    const floor2: Floor = {
      kind: 'floor',
      id: 'floor-2',
      name: 'Floor 1',
      coords: { lat: 23.6142, lng: 58.5412, zoom: 18 },
      zones: [zone('zone-3', 'Open Workspace', '#158b4b', { lat: 23.6147, lng: 58.5416, zoom: 19 })],
    };

    const building: Building = {
      kind: 'building',
      id: 'building-1',
      name: 'Tower 1',
      coords: buildingCoords,
      floors: [floor1, floor2],
    };

    const area: Area = {
      kind: 'area',
      id: 'area-1',
      name: 'Main Campus',
      type: 'indoor_outdoor',
      coords: areaCoords,
      zones: [zone('zone-4', 'Parking Zone', '#a8650a', { lat: 23.6132, lng: 58.5402, zoom: 16 })],
      buildings: [building],
    };

    return {
      kind: 'project',
      id: 'project-1',
      name: 'Muscat Campus',
      description: 'Primary demo project',
      status: 'active',
      coords: projectCoords,
      areas: [area],
    };
  }

  // ===== Read-only helpers (Projects + Locating) =====

  findNode(id: string): HierarchyNode | undefined {
    const stack: HierarchyNode[] = [...this._projects()];
    while (stack.length) {
      const n = stack.pop()!;
      if (n.id === id) return n;
      stack.push(...childrenOf(n));
    }
    return undefined;
  }

  private findWithParent(
    id: string,
  ): { parent: HierarchyNode | null; node: HierarchyNode } | undefined {
    for (const project of this._projects()) {
      if (project.id === id) return { parent: null, node: project };
    }
    const stack: HierarchyNode[] = [...this._projects()];
    while (stack.length) {
      const n = stack.pop()!;
      for (const child of childrenOf(n)) {
        if (child.id === id) return { parent: n, node: child };
        stack.push(child);
      }
    }
    return undefined;
  }

  private flattenZones(projects: Project[]): Zone[] {
    const zones: Zone[] = [];
    const walk = (n: HierarchyNode) => {
      if (n.kind === 'zone') zones.push(n);
      childrenOf(n).forEach(walk);
    };
    projects.forEach(walk);
    return zones;
  }

  // ===== Mutators (Projects only) =====

  addProject(input: AddProjectInput): Project {
    const reference = this._projects()[0]?.coords ?? { lat: 24.4539, lng: 54.3773, zoom: 6 };
    const project: Project = {
      kind: 'project',
      id: this.genId('project'),
      name: input.name,
      description: input.description || undefined,
      weekStart: input.weekStart || undefined,
      weekEnd: input.weekEnd || undefined,
      status: input.status,
      coords: this.jitteredCoords(reference, 0),
      areas: [],
    };
    this._projects.update((projects) => [...projects, project]);
    return project;
  }

  addArea(projectId: string, input: AddAreaInput): Area | undefined {
    const project = this.findNode(projectId);
    if (!project || project.kind !== 'project') return undefined;

    const area: Area = {
      kind: 'area',
      id: this.genId('area'),
      name: input.name,
      type: input.type,
      coords: this.jitteredCoords(project.coords),
      zones: [],
      buildings: [],
    };
    project.areas = [...project.areas, area];
    this._projects.update((projects) => [...projects]);
    return area;
  }

  addZoneToArea(areaId: string, input: AddZoneInput): Zone | undefined {
    const area = this.findNode(areaId);
    if (!area || area.kind !== 'area' || !areaAllowsDirectZones(area.type)) return undefined;

    const zone: Zone = {
      kind: 'zone',
      id: this.genId('zone'),
      name: input.name,
      color: input.color,
      coords: this.jitteredCoords(area.coords, 1),
    };
    area.zones = [...area.zones, zone];
    this._projects.update((projects) => [...projects]);
    return zone;
  }

  addBuilding(areaId: string, input: AddBuildingInput): Building | undefined {
    const area = this.findNode(areaId);
    if (!area || area.kind !== 'area' || !areaAllowsBuildings(area.type)) return undefined;

    const building: Building = {
      kind: 'building',
      id: this.genId('building'),
      name: input.name,
      coords: this.jitteredCoords(area.coords),
      floors: [],
    };
    area.buildings = [...area.buildings, building];
    this._projects.update((projects) => [...projects]);
    return building;
  }

  addFloor(buildingId: string, input: AddFloorInput): Floor | undefined {
    const building = this.findNode(buildingId);
    if (!building || building.kind !== 'building') return undefined;

    const floor: Floor = {
      kind: 'floor',
      id: this.genId('floor'),
      name: input.name,
      coords: this.jitteredCoords(building.coords),
      zones: [],
    };
    building.floors = [...building.floors, floor];
    this._projects.update((projects) => [...projects]);
    return floor;
  }

  addZoneToFloor(floorId: string, input: AddZoneInput): Zone | undefined {
    const floor = this.findNode(floorId);
    if (!floor || floor.kind !== 'floor') return undefined;

    const zone: Zone = {
      kind: 'zone',
      id: this.genId('zone'),
      name: input.name,
      color: input.color,
      coords: this.jitteredCoords(floor.coords, 1),
    };
    floor.zones = [...floor.zones, zone];
    this._projects.update((projects) => [...projects]);
    return zone;
  }

  rename(nodeId: string, newName: string): boolean {
    const node = this.findNode(nodeId);
    if (!node) return false;
    node.name = newName;
    this._projects.update((projects) => [...projects]);
    return true;
  }

  /** Returns false (and does nothing) if this would remove the last remaining project. */
  deleteNode(nodeId: string): boolean {
    const found = this.findWithParent(nodeId);
    if (!found) return false;

    if (found.parent === null) {
      if (this._projects().length <= 1) return false;
      this._projects.update((projects) => projects.filter((p) => p.id !== nodeId));
      return true;
    }

    const parent = found.parent;
    switch (parent.kind) {
      case 'project':
        parent.areas = parent.areas.filter((a) => a.id !== nodeId);
        break;
      case 'area':
        parent.zones = parent.zones.filter((z) => z.id !== nodeId);
        parent.buildings = parent.buildings.filter((b) => b.id !== nodeId);
        break;
      case 'building':
        parent.floors = parent.floors.filter((f) => f.id !== nodeId);
        break;
      case 'floor':
        parent.zones = parent.zones.filter((z) => z.id !== nodeId);
        break;
    }
    this._projects.update((projects) => [...projects]);
    return true;
  }
}
