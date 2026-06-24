import { Component, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProcessAutomationService } from '../services/process-automation.service';

export type LogicOperator = 'AND' | 'OR';

export interface ConditionRow {
  id: number;
  value: string;
  operator: LogicOperator; // operator joining THIS row to the previous one (ignored for row 0)
  open: boolean;           // is the options panel open
}

export interface ActionRow {
  id: number;
  value: string;
  open: boolean;
}

export interface AutomationListItem {
  id: number;
  name: string;
}

@Component({
  standalone: true,
  selector: 'app-process-automation-add',
  imports: [CommonModule, FormsModule],
  providers: [ProcessAutomationService],
  templateUrl: './process-automation-add.html',
  styleUrls: ['./process-automation-add.css']
})
export class ProcessAutomationAdd {
  // ----- Sidebar -----
  searchTerm = '';

  automations: AutomationListItem[] = [
    { id: 1, name: 'Track People' }
  ];

  selectedAutomationId: number | null = 1;

  get filteredAutomations(): AutomationListItem[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.automations;
    return this.automations.filter(a => a.name.toLowerCase().includes(term));
  }

  selectAutomation(item: AutomationListItem): void {
    this.selectedAutomationId = item.id;
  }

  // ----- Main form -----
  title = '';

  conditionOptions = [
    'When the device is',
    'When the time is',
    'When the people is',
    'When the zone is'
  ];

  actionOptions = [
    'Trigger device(s) to..',
    'Send an alarm notification'
  ];

  private conditionRowId = 1;
  private actionRowId = 1;

  conditions: ConditionRow[] = [
    { id: this.conditionRowId++, value: '', operator: 'AND', open: false }
  ];

  actions: ActionRow[] = [
    { id: this.actionRowId++, value: '', open: false }
  ];

  setTimePeriod = false;

  submitted = false;

  constructor(
    private service: ProcessAutomationService,
    private router: Router,
    private elRef: ElementRef
  ) {}

  // Close any open dropdown when clicking outside of it
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!this.elRef.nativeElement.contains(target)) {
      this.closeAllDropdowns();
      return;
    }
    if (!target.closest('.pa-dropdown-wrap')) {
      this.closeAllDropdowns();
    }
  }

  private closeAllDropdowns(): void {
    this.conditions.forEach(c => (c.open = false));
    this.actions.forEach(a => (a.open = false));
  }

  // ===== Relationship label, e.g. "A", "AANDB", "AANDBORC" =====
  get relationshipLabel(): string {
    return this.conditions
      .map((c, i) => {
        const letter = String.fromCharCode(65 + i);
        return i === 0 ? letter : c.operator + letter;
      })
      .join('');
  }

  // ===== Conditions =====
  conditionLabel(index: number): string {
    return 'Condition ' + String.fromCharCode(65 + index);
  }

  toggleConditionDropdown(row: ConditionRow): void {
    const wasOpen = row.open;
    this.closeAllDropdowns();
    row.open = !wasOpen;
  }

  selectConditionOption(row: ConditionRow, option: string): void {
    row.value = option;
    row.open = false;
  }

  addCondition(): void {
    this.conditions.push({
      id: this.conditionRowId++,
      value: '',
      operator: 'AND',
      open: false
    });
  }

  removeCondition(id: number): void {
    if (this.conditions.length === 1) return;
    this.conditions = this.conditions.filter(c => c.id !== id);
  }

  // ===== Actions =====
  actionLabel(index: number): string {
    return 'Action ' + String.fromCharCode(65 + index);
  }

  toggleActionDropdown(row: ActionRow): void {
    const wasOpen = row.open;
    this.closeAllDropdowns();
    row.open = !wasOpen;
  }

  selectActionOption(row: ActionRow, option: string): void {
    row.value = option;
    row.open = false;
  }

  addAction(): void {
    this.actions.push({ id: this.actionRowId++, value: '', open: false });
  }

  removeAction(id: number): void {
    if (this.actions.length === 1) return;
    this.actions = this.actions.filter(a => a.id !== id);
  }

  // ===== Create / Cancel =====
  create(): void {
    this.submitted = true;
    if (!this.title.trim()) return;

    const payload = {
      title: this.title.trim(),
      relationship: this.relationshipLabel,
      conditions: this.conditions.map(c => ({
        value: c.value,
        operator: c.operator
      })),
      setTimePeriod: this.setTimePeriod,
      actions: this.actions.map(a => a.value).filter(Boolean)
    };

    const svc: any = this.service;
    if (typeof svc.addRule === 'function') {
      svc.addRule(payload);
    } else if (typeof svc.create === 'function') {
      svc.create(payload);
    }

    this.router.navigate(['/process-automation']);
  }

  cancel(): void {
    this.router.navigate(['/process-automation']);
  }
}