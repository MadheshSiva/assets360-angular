import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProcessAutomationService, AutomationRule } from '../services/process-automation.service';

@Component({
  standalone: true,
  selector: 'app-process-automation',
  imports: [CommonModule, FormsModule],
  providers: [ProcessAutomationService],
  templateUrl: './process-automation.html',
  styleUrls: ['./process-automation.css']
})
export class ProcessAutomation {
  rules: AutomationRule[] = [];
  searchTerm = '';
  isAdding = false;
  editingId: number | null = null;
  editBuffer: Partial<AutomationRule> = {};
  newRule: Partial<AutomationRule> = { ruleName: '', type: 'Standard', status: 'Pending' };

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  constructor(
    private service: ProcessAutomationService,
    private router: Router
  ) {
    this.rules = this.service.getRules();
  }

  get filteredRules(): AutomationRule[] {
    return this.service.search(this.searchTerm);
  }

  todayIso(): string {
    return new Date().toISOString().slice(0, 10);
  }

  navigateToAdd(): void {
    this.router.navigate(['/process-automation/add']);
  }

  confirmAdd(): void {
    const name = (this.newRule.ruleName || '').trim();
    if (!name) return;
    this.service.addRule({
      ruleName: name,
      type: this.newRule.type || 'Standard',
      status: (this.newRule.status as AutomationRule['status']) || 'Pending'
    });
    this.isAdding = false;
    this.newRule = { ruleName: '', type: 'Standard', status: 'Pending' };
  }

  cancelAdd(): void {
    this.isAdding = false;
  }

  startEdit(rule: AutomationRule): void {
    this.isAdding = false;
    this.editingId = rule.id;
    this.editBuffer = { ...rule };
  }

  confirmEdit(): void {
    if (this.editingId === null) return;
    this.service.updateRule(this.editingId, this.editBuffer);
    this.editingId = null;
    this.editBuffer = {};
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editBuffer = {};
  }

  deleteRule(id: number): void {
    if (!confirm('Delete this rule?')) return;
    this.service.deleteRule(id);
  }

  deleteAll(): void {
    if (this.service.getRules().length === 0) return;
    if (!confirm('Delete all rules? This cannot be undone.')) return;
    this.service.deleteAll();
  }

  refresh(): void {
    this.searchTerm = '';
    this.isAdding = false;
    this.editingId = null;
  }

  exportCsv(): void {
    const header = ['Rule Name', 'Type', 'Last Activated', 'Created On', 'Status'];
    const rows = this.filteredRules.map(r => [r.ruleName, r.type, r.lastActivated, r.createdOn, r.status]);
    const csv = [header, ...rows].map(row => row.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'process-automation-rules.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  triggerImport(): void {
    this.fileInputRef.nativeElement.click();
  }

  handleFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.service.importFromCsv(String(reader.result || ''));
    };
    reader.readAsText(file);
    input.value = '';
  }
}
