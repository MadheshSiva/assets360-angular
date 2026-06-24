import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AutomationRule {
  id: number;
  ruleName: string;
  type: string;
  lastActivated: string;
  createdOn: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

@Injectable()
export class ProcessAutomationService {
  private rulesSubject = new BehaviorSubject<AutomationRule[]>([
    { id: 1, ruleName: 'state one', type: 'Standard', lastActivated: '2026-07-06', createdOn: '2026-05-01', status: 'Completed' },
    { id: 2, ruleName: 'zone level process', type: 'Standard', lastActivated: '2026-07-06', createdOn: '2026-05-01', status: 'Pending' },
    { id: 3, ruleName: 'Controler', type: 'Standard', lastActivated: '2026-07-06', createdOn: '2026-05-01', status: 'Pending' },
    { id: 4, ruleName: 'Operation 1', type: 'Standard', lastActivated: '2026-07-06', createdOn: '2026-07-06', status: 'Pending' }
  ]);
  private nextIdSubject = new BehaviorSubject<number>(5);

  private nextId = this.nextIdSubject.asObservable();

  getRules(): AutomationRule[] {
    return this.rulesSubject.value;
  }

  addRule(rule: Omit<AutomationRule, 'id' | 'lastActivated' | 'createdOn'>): AutomationRule {
    const today = new Date().toISOString().slice(0, 10);
    const currentId = this.nextIdSubject.value;
    const newRule: AutomationRule = {
      ...rule,
      id: currentId,
      lastActivated: today,
      createdOn: today
    } as AutomationRule;
    this.rulesSubject.next([newRule, ...this.rulesSubject.value]);
    this.nextIdSubject.next(currentId + 1);
    return newRule;
  }

  updateRule(id: number, changes: Partial<AutomationRule>): void {
    this.rulesSubject.next(
      this.rulesSubject.value.map(r => r.id === id ? { ...r, ...changes } as AutomationRule : r)
    );
  }

  deleteRule(id: number): void {
    this.rulesSubject.next(this.rulesSubject.value.filter(r => r.id !== id));
  }

  deleteAll(): void {
    this.rulesSubject.next([]);
  }

  search(term: string): AutomationRule[] {
    const t = term.trim().toLowerCase();
    if (!t) return this.rulesSubject.value;
    return this.rulesSubject.value.filter(r =>
      r.ruleName.toLowerCase().includes(t) ||
      r.type.toLowerCase().includes(t) ||
      r.status.toLowerCase().includes(t)
    );
  }

  importFromCsv(csvText: string): void {
    const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
    lines.slice(1).forEach(line => {
      const cols = line.split(',').map(c => c.replace(/^"|"$/g, ''));
      if (cols.length >= 5) {
        const currentId = this.nextIdSubject.value;
        const newRule: AutomationRule = {
          id: currentId,
          ruleName: cols[0],
          type: cols[1],
          lastActivated: cols[2],
          createdOn: cols[3],
          status: (cols[4] as AutomationRule['status']) || 'Pending'
        };
        this.rulesSubject.next([...this.rulesSubject.value, newRule]);
        this.nextIdSubject.next(currentId + 1);
      }
    });
  }
}
