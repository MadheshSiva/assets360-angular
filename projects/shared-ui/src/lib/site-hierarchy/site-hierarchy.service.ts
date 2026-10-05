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
  State,
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
  description?: string;
  timeZone?: string;
  countryCode?: string;
  status?: 'active' | 'inactive';
  coords?: Coords;
}

export interface AddStateInput {
  name: string;
  type: AreaType;
  description?: string;
  status?: 'active' | 'inactive';
  coords?: Coords;
}

export interface AddZoneInput {
  name: string;
  color: string;
  description?: string;
  mapImage?: string;
  topZone?: string;
  priority?: string;
  exit?: string;
  assemblyPoint?: 'active' | 'inactive';
  status?: 'active' | 'inactive';
  coords?: Coords;
}

export interface AddBuildingInput {
  name: string;
  description?: string;
  status?: 'active' | 'inactive';
  coords?: Coords;
}

export interface AddFloorInput {
  name: string;
  description?: string;
  mapImage?: string;
  status?: 'active' | 'inactive';
}

/**
 * Single source of truth for the Project -> Area (Country) -> State ->
 * (Zone and/or Building -> Floor -> Zone) hierarchy. Projects (Administration -> Configuration)
 * is the only consumer allowed to call the mutators below; Locating reads `projects` only.
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
    const projectCoords: Coords = { lat: 25.2048, lng: 55.2708, zoom: 6 };
    const areaCoords: Coords = { lat: 25.2048, lng: 55.2708, zoom: 11 };
    const floorCoords: Coords = { lat: 25.2048, lng: 55.2708, zoom: 17 };

    const zone = (id: string, name: string, color: string, coords: Coords, subZones: Zone[] = []): Zone => ({
      kind: 'zone',
      id,
      name,
      color,
      coords,
      zones: subZones,
    });

    // Azy floor is a sub-zone nested inside Second Colony.
    const azyFloorZone = zone('zone-2', 'Azy floor', '#dc2626', { lat: 25.2045, lng: 55.2705, zoom: 19 });
    const secondColonyZone = zone('zone-1', 'Second Colony', '#158b4b', { lat: 25.2051, lng: 55.2711, zoom: 19 }, [
      azyFloorZone,
    ]);

    const thirdRightFloor: Floor = {
      kind: 'floor',
      id: 'floor-1',
      name: 'Third Right',
      coords: floorCoords,
      zones: [secondColonyZone],
    };

    const building: Building = {
      kind: 'building',
      id: 'building-1',
      name: 'Street One',
      coords: areaCoords,
      floors: [thirdRightFloor],
    };

    const state: State = {
      kind: 'state',
      id: 'state-1',
      name: 'Oman',
      type: 'indoor',
      coords: areaCoords,
      zones: [],
      buildings: [building],
    };

    // Country -> State -> Building -> Floor -> Zone.
    const area: Area = {
      kind: 'area',
      id: 'area-1',
      name: 'UAE',
      coords: areaCoords,
      states: [state],
    };

    return {
      kind: 'project',
      id: 'project-1',
      name: 'Track Assets',
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
      coords: input.coords ?? this.jitteredCoords(project.coords),
      states: [],
      description: input.description || undefined,
      timeZone: input.timeZone || undefined,
      countryCode: input.countryCode || undefined,
      status: input.status ?? 'active',
    };
    project.areas = [...project.areas, area];
    this._projects.update((projects) => [...projects]);
    return area;
  }

  addState(areaId: string, input: AddStateInput): State | undefined {
    const area = this.findNode(areaId);
    if (!area || area.kind !== 'area') return undefined;

    const state: State = {
      kind: 'state',
      id: this.genId('state'),
      name: input.name,
      type: input.type,
      coords: input.coords ?? this.jitteredCoords(area.coords),
      zones: [],
      buildings: [],
      description: input.description || undefined,
      status: input.status ?? 'active',
    };
    area.states = [...area.states, state];
    this._projects.update((projects) => [...projects]);
    return state;
  }

  addZoneToState(stateId: string, input: AddZoneInput): Zone | undefined {
    const state = this.findNode(stateId);
    if (!state || state.kind !== 'state' || !areaAllowsDirectZones(state.type)) return undefined;

    const zone: Zone = {
      kind: 'zone',
      id: this.genId('zone'),
      name: input.name,
      color: input.color,
      coords: input.coords ?? this.jitteredCoords(state.coords, 1),
      zones: [],
      description: input.description || undefined,
      mapImage: input.mapImage || undefined,
      topZone: input.topZone || undefined,
      priority: input.priority || undefined,
      exit: input.exit || undefined,
      assemblyPoint: input.assemblyPoint ?? 'active',
      status: input.status ?? 'active',
    };
    state.zones = [...state.zones, zone];
    this._projects.update((projects) => [...projects]);
    return zone;
  }

  addBuilding(stateId: string, input: AddBuildingInput): Building | undefined {
    const state = this.findNode(stateId);
    if (!state || state.kind !== 'state' || !areaAllowsBuildings(state.type)) return undefined;

    const building: Building = {
      kind: 'building',
      id: this.genId('building'),
      name: input.name,
      coords: input.coords ?? this.jitteredCoords(state.coords),
      floors: [],
      description: input.description || undefined,
      status: input.status ?? 'active',
    };
    state.buildings = [...state.buildings, building];
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
      description: input.description || undefined,
      mapImage: input.mapImage || undefined,
      status: input.status ?? 'active',
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
      coords: input.coords ?? this.jitteredCoords(floor.coords, 1),
      zones: [],
      description: input.description || undefined,
      mapImage: input.mapImage || undefined,
      topZone: input.topZone || undefined,
      priority: input.priority || undefined,
      exit: input.exit || undefined,
      assemblyPoint: input.assemblyPoint ?? 'active',
      status: input.status ?? 'active',
    };
    floor.zones = [...floor.zones, zone];
    this._projects.update((projects) => [...projects]);
    return zone;
  }

  addSubZone(parentZoneId: string, input: AddZoneInput): Zone | undefined {
    const parentZone = this.findNode(parentZoneId);
    if (!parentZone || parentZone.kind !== 'zone') return undefined;

    const zone: Zone = {
      kind: 'zone',
      id: this.genId('zone'),
      name: input.name,
      color: input.color,
      coords: input.coords ?? this.jitteredCoords(parentZone.coords, 1),
      zones: [],
      description: input.description || undefined,
      mapImage: input.mapImage || undefined,
      topZone: input.topZone || undefined,
      priority: input.priority || undefined,
      exit: input.exit || undefined,
      assemblyPoint: input.assemblyPoint ?? 'active',
      status: input.status ?? 'active',
    };
    parentZone.zones = [...parentZone.zones, zone];
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
        parent.states = parent.states.filter((s) => s.id !== nodeId);
        break;
      case 'state':
        parent.zones = parent.zones.filter((z) => z.id !== nodeId);
        parent.buildings = parent.buildings.filter((b) => b.id !== nodeId);
        break;
      case 'building':
        parent.floors = parent.floors.filter((f) => f.id !== nodeId);
        break;
      case 'floor':
        parent.zones = parent.zones.filter((z) => z.id !== nodeId);
        break;
      case 'zone':
        parent.zones = parent.zones.filter((z) => z.id !== nodeId);
        break;
    }
    this._projects.update((projects) => [...projects]);
    return true;
  }
}
