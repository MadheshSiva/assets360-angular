import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HierarchyNode } from '../../models/hierarchy-node.model';

@Component({
  standalone: true,
  selector: 'app-hierarchy-node',
  imports: [CommonModule, HierarchyNodeComponent],
  templateUrl: './hierarchy-node.html',
  styleUrls: ['./hierarchy-node.css']
})
export class HierarchyNodeComponent {
  @Input() node!: HierarchyNode;
  @Input() level = 0;

  @Output() changed = new EventEmitter<void>();

  toggleExpand(): void {
    if (this.node.children?.length) {
      this.node.expanded = !this.node.expanded;
    }
  }

  toggleCheck(): void {
    const next = !this.node.checked;
    this.setCheckedRecursive(this.node, next);
    this.changed.emit();
  }

  onChildChanged(): void {
    this.syncFromChildren();
    this.changed.emit();
  }

  private setCheckedRecursive(node: HierarchyNode, value: boolean): void {
    node.checked = value;
    node.children?.forEach(child => this.setCheckedRecursive(child, value));
  }

  private syncFromChildren(): void {
    if (!this.node.children?.length) return;
    this.node.checked = this.node.children.every(c => c.checked);
  }

  get isIndeterminate(): boolean {
    if (!this.node.children?.length) return false;
    const someChecked = this.node.children.some(c => c.checked || this.hasIndeterminateChild(c));
    return !this.node.checked && someChecked;
  }

  private hasIndeterminateChild(node: HierarchyNode): boolean {
    if (!node.children?.length) return false;
    const someChecked = node.children.some(c => c.checked);
    const allChecked = node.children.every(c => c.checked);
    return someChecked && !allChecked;
  }

  get hasChildren(): boolean {
    return !!this.node.children?.length;
  }
}