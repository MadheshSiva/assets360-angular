export interface Coords {
  lat: number;
  lng: number;
  zoom: number;
}

export type AreaType = 'indoor' | 'outdoor' | 'indoor_outdoor';
export type ProjectStatus = 'active' | 'inactive';

export interface Zone {
  kind: 'zone';
  id: string;
  name: string;
  color: string;
  coords: Coords;
  /** Nested sub-zones, addable from any zone via its own "+" action. */
  zones: Zone[];
  /** Set when this zone is added via the "Add Zone" form. */
  description?: string;
  /** Data URL of a locally-picked map image, or the backend's uploaded map URL once saved. */
  mapImage?: string;
  /** Free-text "Top Zone" description — only used by a zone added directly under a Floor. */
  topZone?: string;
  /** Whether this sub-zone is itself a top zone — only used by a zone added under another Zone (a sub-zone). */
  isTopZone?: 'active' | 'inactive';
  priority?: string;
  /** Whether this zone is an exit point. */
  exit?: 'active' | 'inactive';
  /** Whether this zone is a muster/assembly point. */
  assemblyPoint?: 'active' | 'inactive';
  /** Minutes to reach the assembly point from this zone. */
  timeTakenAssemblePoint?: number;
  status?: 'active' | 'inactive';
}

export interface Floor {
  kind: 'floor';
  id: string;
  name: string;
  coords: Coords;
  zones: Zone[];
  /** "Street" metadata, set when this floor is added via the "Add Floor" form. */
  description?: string;
  /** Data URL of an uploaded map image. */
  mapImage?: string;
  status?: 'active' | 'inactive';
}

export interface Building {
  kind: 'building';
  id: string;
  name: string;
  coords: Coords;
  floors: Floor[];
  /** "City" metadata, set when this building is added via the "Add Building" form. */
  description?: string;
  status?: 'active' | 'inactive';
}

export interface OuterZone {
  kind: 'outerZone';
  id: string;
  name: string;
  coords: Coords;
  buildings: Building[];
  description?: string;
  status?: 'active' | 'inactive';
}

export interface State {
  kind: 'state';
  id: string;
  name: string;
  /** Drives the "Outdoor Map" field: whether this state holds zones, outer zones, or both directly. */
  type: AreaType;
  coords: Coords;
  /** Only populated when type is 'outdoor' or 'indoor_outdoor'. */
  zones: Zone[];
  /** Only populated when type is 'indoor' or 'indoor_outdoor'. Buildings nest under one of these, not directly under the state. */
  outerZones: OuterZone[];
  description?: string;
  status?: 'active' | 'inactive';
}

export interface Area {
  kind: 'area';
  id: string;
  name: string;
  coords: Coords;
  states: State[];
  /** Country-level metadata, set when this area is added via the "Add Country" form. */
  description?: string;
  timeZone?: string;
  countryCode?: string;
  status?: 'active' | 'inactive';
}

export interface Project {
  kind: 'project';
  id: string;
  name: string;
  description?: string;
  weekStart?: string; // yyyy-MM-dd
  weekEnd?: string; // yyyy-MM-dd
  status: ProjectStatus;
  coords: Coords;
  areas: Area[];
}

export type HierarchyNode = Project | Area | State | OuterZone | Building | Floor | Zone;

export const AREA_TYPE_LABELS: Record<AreaType, string> = {
  indoor: 'Indoor',
  outdoor: 'Outdoor',
  indoor_outdoor: 'Indoor + Outdoor',
};

/** Compact form for space-constrained badges (cascade-list rows); full labels above are for forms/dropdowns. */
export const AREA_TYPE_SHORT_LABELS: Record<AreaType, string> = {
  indoor: 'Indoor',
  outdoor: 'Outdoor',
  indoor_outdoor: 'Mixed',
};

export function areaAllowsDirectZones(type: AreaType): boolean {
  return type === 'outdoor' || type === 'indoor_outdoor';
}

export function areaAllowsBuildings(type: AreaType): boolean {
  return type === 'indoor' || type === 'indoor_outdoor';
}

/** Children of a node for cascade-list / tree-walking purposes, regardless of kind. */
export function childrenOf(node: HierarchyNode): HierarchyNode[] {
  switch (node.kind) {
    case 'project':
      return node.areas;
    case 'area':
      return node.states;
    case 'state':
      return [...node.zones, ...node.outerZones];
    case 'outerZone':
      return node.buildings;
    case 'building':
      return node.floors;
    case 'floor':
      return node.zones;
    case 'zone':
      return node.zones;
  }
}
