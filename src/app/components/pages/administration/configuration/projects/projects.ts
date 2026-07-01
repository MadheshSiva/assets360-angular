import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapComponent, MapLocation } from '../../../../shared/map/map';

export type TrackMode = 'people' | 'assets';
export type ProjectStatus = 'active' | 'inactive';

export interface LocationNode {
  name: string;
  coords: { lat: number; lng: number; zoom: number };
  children?: LocationNode[];
  // Project-level metadata. Only meaningful on root nodes (top-level projects),
  // but kept on the shared interface since the tree is recursively typed.
  description?: string;
  weekStart?: string; // yyyy-MM-dd, matches <input type="date"> value format
  weekEnd?: string; // yyyy-MM-dd
  status?: ProjectStatus;
}

export interface AddProjectForm {
  name: string;
  description: string;
  weekStart: string;
  weekEnd: string;
  status: ProjectStatus;
}

@Component({
  standalone: true,
  selector: 'app-projects',
  imports: [CommonModule, FormsModule, MapComponent],
  templateUrl: './projects.html',
  styleUrls: ['./projects.css']
})
export class Projects {
  mode: TrackMode = 'people';

  expanded: Set<string> = new Set<string>();

  // Name of the row currently being renamed inline (null when nothing is being edited)
  editingName: string | null = null;
  editingValue: string = '';

  @ViewChild(MapComponent, { static: false }) mapComponent?: MapComponent;

  // Top-level projects. Each entry is an independent root location tree.
  locationTree: LocationNode[] = [
    {
      name: 'UAE',
      coords: { lat: 24.4539, lng: 54.3773, zoom: 6 },
      status: 'active',
      children: [
        {
          name: 'Oman',
          coords: { lat: 23.585, lng: 58.405, zoom: 7 },
          children: [
            {
              name: 'Street One',
              coords: { lat: 23.612, lng: 58.539, zoom: 13 },
              children: [
                {
                  name: 'Street Colony',
                  coords: { lat: 23.6145, lng: 58.541, zoom: 15 },
                  children: [
                    {
                      name: 'Third Right',
                      coords: { lat: 23.6155, lng: 58.542, zoom: 17 },
                      children: [
                        {
                          name: 'Azy floor',
                          coords: { lat: 23.6158, lng: 58.5423, zoom: 19 },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  // --- Add Project modal state ---
  isAddProjectOpen = false;
  addProjectForm: AddProjectForm = this.emptyAddProjectForm();
  addProjectError: string | null = null;

  private emptyAddProjectForm(): AddProjectForm {
    return {
      name: '',
      description: '',
      weekStart: '',
      weekEnd: '',
      status: 'active',
    };
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

    const existingNames = this.collectAllNames();
    if (existingNames.has(name)) {
      this.addProjectError = `"${name}" is already in use. Choose a different name.`;
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

    const referenceCoords = this.locationTree[0]?.coords ?? { lat: 24.4539, lng: 54.3773, zoom: 6 };
    const jitter = () => (Math.random() - 0.5) * 4;

    const newProject: LocationNode = {
      name,
      coords: {
        lat: referenceCoords.lat + jitter(),
        lng: referenceCoords.lng + jitter(),
        zoom: 6,
      },
      description: this.addProjectForm.description.trim() || undefined,
      weekStart: this.addProjectForm.weekStart || undefined,
      weekEnd: this.addProjectForm.weekEnd || undefined,
      status: this.addProjectForm.status,
    };

    this.locationTree = [...this.locationTree, newProject];
    this.isAddProjectOpen = false;

    if (this.mapComponent) {
      this.mapComponent.flyTo(newProject.coords);
    }
  }

  get modeLabel(): string {
    return this.mode === 'people' ? 'Track People' : 'Track Assets';
  }

  /**
   * Visible rows across ALL top-level projects: the mode header, followed by
   * each root project and, for whichever root is expanded, its expanded descendant chain.
   */
  get visibleChain(): string[] {
    const chain: string[] = [this.modeLabel];

    for (const root of this.locationTree) {
      chain.push(root.name);
      let node: LocationNode = root;
      while (node.children && node.children.length > 0 && this.expanded.has(node.name)) {
        const next: LocationNode = node.children[0];
        chain.push(next.name);
        node = next;
      }
    }

    return chain;
  }

  get activeCoords(): { lat: number; lng: number; zoom: number } | undefined {
    return this.activeNode?.coords;
  }

  /** The deepest currently-expanded node across all projects, i.e. the one the map should focus. */
  private get activeNode(): LocationNode | undefined {
    let result: LocationNode | undefined;
    for (const root of this.locationTree) {
      let node: LocationNode = root;
      result = node;
      while (node.children && node.children.length > 0 && this.expanded.has(node.name)) {
        node = node.children[0];
        result = node;
      }
    }
    return result;
  }

  isActive(name: string): boolean {
    if (name === this.modeLabel) return false;
    const chain = this.visibleChain;
    return chain[chain.length - 1] === name;
  }

  isExpandable(name: string): boolean {
    if (this.expanded.has(name)) return false;
    return this.findNode(name)?.children?.length ? true : false;
  }

  /** Depth of a row name within visibleChain, for indentation purposes (mode header excluded). */
  depthOf(name: string): number {
    return this.visibleChain.indexOf(name);
  }

  get mapLocations(): MapLocation[] {
    return this.locationTree;
  }

  toggle(name: string): void {
    const isCurrentlyExpanded = this.expanded.has(name);

    if (isCurrentlyExpanded) {
      const next = new Set(this.expanded);
      next.delete(name);

      const node = this.findNode(name);
      if (node?.children?.length) {
        const collectDescendants = (n: LocationNode) => {
          (n.children ?? []).forEach((child) => {
            next.delete(child.name);
            collectDescendants(child);
          });
        };
        collectDescendants(node);
      }

      this.expanded = next;
      return;
    }

    if (!this.isExpandable(name)) return;
    this.expanded = new Set(this.expanded).add(name);

    const node = this.findNode(name);
    if (this.mapComponent && node) {
      this.mapComponent.flyTo(node.coords);
    }
  }

  private findNode(name: string): LocationNode | undefined {
    const stack: LocationNode[] = [...this.locationTree];
    while (stack.length) {
      const n: LocationNode = stack.pop()!;
      if (n.name === name) return n;
      if (n.children) stack.push(...n.children);
    }
    return undefined;
  }

  /**
   * Finds the parent of the node with the given name, plus the node itself.
   * Returns null parent if the node is a top-level project (root).
   */
  private findNodeWithParent(name: string): { parent: LocationNode | null; node: LocationNode } | undefined {
    const rootMatch = this.locationTree.find((r) => r.name === name);
    if (rootMatch) {
      return { parent: null, node: rootMatch };
    }

    const stack: LocationNode[] = [...this.locationTree];
    while (stack.length) {
      const n: LocationNode = stack.pop()!;
      if (n.children) {
        for (const child of n.children) {
          if (child.name === name) return { parent: n, node: child };
          stack.push(child);
        }
      }
    }
    return undefined;
  }

  /** Collects every name currently used across all project trees, to avoid duplicate keys. */
  private collectAllNames(): Set<string> {
    const names = new Set<string>();
    const walk = (n: LocationNode) => {
      names.add(n.name);
      (n.children ?? []).forEach(walk);
    };
    this.locationTree.forEach(walk);
    return names;
  }

  /** Derives a coordinate for a brand-new child: nudges slightly off the parent and zooms in one step. */
  private deriveChildCoords(parent: LocationNode): { lat: number; lng: number; zoom: number } {
    const jitter = () => (Math.random() - 0.5) * 0.01;
    return {
      lat: parent.coords.lat + jitter(),
      lng: parent.coords.lng + jitter(),
      zoom: Math.min(parent.coords.zoom + 2, 20),
    };
  }

  /** Adds a new child location under the row whose name was clicked. */
  addChild(name: string): void {
    const parent = this.findNode(name);
    if (!parent) return;

    const existingNames = this.collectAllNames();
    let proposed = window.prompt(`New location name under "${name}":`, '');
    if (proposed === null) return; // user cancelled

    proposed = proposed.trim();
    if (!proposed) return;

    let finalName = proposed;
    let suffix = 2;
    while (existingNames.has(finalName)) {
      finalName = `${proposed} (${suffix})`;
      suffix++;
    }

    const newNode: LocationNode = {
      name: finalName,
      coords: this.deriveChildCoords(parent),
    };

    parent.children = [...(parent.children ?? []), newNode];
    this.locationTree = [...this.locationTree];

    // Expand the parent so the new child is visible immediately
    this.expanded = new Set(this.expanded).add(parent.name);

    if (this.mapComponent) {
      this.mapComponent.flyTo(newNode.coords);
    }
  }

  /** Begins inline rename for the given row. */
  startEdit(name: string, event?: Event): void {
    event?.stopPropagation();
    this.editingName = name;
    this.editingValue = name;
  }

  /** Commits the inline rename, validating against duplicates. */
  commitEdit(): void {
    if (this.editingName === null) return;

    const oldName = this.editingName;
    const newName = this.editingValue.trim();

    if (!newName || newName === oldName) {
      this.cancelEdit();
      return;
    }

    const existingNames = this.collectAllNames();
    existingNames.delete(oldName);
    if (existingNames.has(newName)) {
      window.alert(`"${newName}" is already in use. Choose a different name.`);
      return;
    }

    const found = this.findNodeWithParent(oldName);
    if (!found) {
      this.cancelEdit();
      return;
    }

    found.node.name = newName;
    this.locationTree = [...this.locationTree];

    // Keep expanded-set membership consistent with the renamed node
    if (this.expanded.has(oldName)) {
      const next = new Set(this.expanded);
      next.delete(oldName);
      next.add(newName);
      this.expanded = next;
    }

    this.cancelEdit();
  }

  cancelEdit(): void {
    this.editingName = null;
    this.editingValue = '';
  }

  /** Deletes the row (and its subtree). If it's a top-level project, removes it from locationTree directly. */
  deleteNode(name: string, event?: Event): void {
    event?.stopPropagation();

    const found = this.findNodeWithParent(name);
    if (!found) return;

    const confirmed = window.confirm(`Delete "${name}" and everything under it?`);
    if (!confirmed) return;

    if (found.parent === null) {
      // Top-level project: remove from the root array, but keep at least one project.
      if (this.locationTree.length <= 1) {
        window.alert('At least one project must remain.');
        return;
      }
      this.locationTree = this.locationTree.filter((r) => r.name !== name);
    } else {
      found.parent.children = (found.parent.children ?? []).filter((c) => c.name !== name);
      this.locationTree = [...this.locationTree];
    }

    // Clean up expanded state for the removed node and all its descendants
    const next = new Set(this.expanded);
    next.delete(name);
    const collectDescendants = (n: LocationNode) => {
      (n.children ?? []).forEach((child) => {
        next.delete(child.name);
        collectDescendants(child);
      });
    };
    collectDescendants(found.node);
    this.expanded = next;

    if (this.editingName === name) {
      this.cancelEdit();
    }
  }

  trackByName = (_: number, name: string) => name;
}