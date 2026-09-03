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
  /** Data URL of an uploaded map image. */
  mapImage?: string;
  topZone?: string;
  priority?: string;
  exit?: string;
  assemblyPoint?: 'active' | 'inactive';
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

export interface State {
  kind: 'state';
  id: string;
  name: string;
  /** Drives the "Outdoor Map" field: whether this state holds zones, buildings, or both directly. */
  type: AreaType;
  coords: Coords;
  /** Only populated when type is 'outdoor' or 'indoor_outdoor'. */
  zones: Zone[];
  /** Only populated when type is 'indoor' or 'indoor_outdoor'. */
  buildings: Building[];
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

export type HierarchyNode = Project | Area | State | Building | Floor | Zone;

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
      return [...node.zones, ...node.buildings];
    case 'building':
      return node.floors;
    case 'floor':
      return node.zones;
    case 'zone':
      return node.zones;
  }
}
