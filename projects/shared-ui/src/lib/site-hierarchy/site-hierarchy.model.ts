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
}

export interface Floor {
  kind: 'floor';
  id: string;
  name: string;
  coords: Coords;
  zones: Zone[];
}

export interface Building {
  kind: 'building';
  id: string;
  name: string;
  coords: Coords;
  floors: Floor[];
}

export interface Area {
  kind: 'area';
  id: string;
  name: string;
  type: AreaType;
  coords: Coords;
  /** Only populated when type is 'outdoor' or 'indoor_outdoor'. */
  zones: Zone[];
  /** Only populated when type is 'indoor' or 'indoor_outdoor'. */
  buildings: Building[];
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

export type HierarchyNode = Project | Area | Building | Floor | Zone;

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
      return [...node.zones, ...node.buildings];
    case 'building':
      return node.floors;
    case 'floor':
      return node.zones;
    case 'zone':
      return [];
  }
}
