export interface HierarchyNode {
  id: string;
  name: string;
  checked: boolean;
  expanded: boolean;
  children?: HierarchyNode[];
}