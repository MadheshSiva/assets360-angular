import { Injectable } from '@angular/core';
import { InspectionPriorityItem } from './priority.model';

@Injectable({ providedIn: 'root' })
export class InspectionPriorityService {
  readonly priorityNameMaster: string[] = ['Low', 'Normal', 'High', 'Urgent', 'Emergency'];

  private readonly records: InspectionPriorityItem[] = [
    {
      priorityCode: 'PRI-1001',
      priorityName: 'Low',
      responseTime: '24 Hours',
      completionSla: '5 Days',
      colour: '#1e7e34',
      escalationRule: 'No escalation',
      status: true
    },
    {
      priorityCode: 'PRI-1002',
      priorityName: 'Normal',
      responseTime: '8 Hours',
      completionSla: '3 Days',
      colour: '#2563eb',
      escalationRule: 'Escalate after 1 day',
      status: true
    },
    {
      priorityCode: 'PRI-1003',
      priorityName: 'High',
      responseTime: '4 Hours',
      completionSla: '1 Day',
      colour: '#b8860b',
      escalationRule: 'Escalate after 4 hours',
      status: true
    },
    {
      priorityCode: 'PRI-1004',
      priorityName: 'Urgent',
      responseTime: '1 Hour',
      completionSla: '8 Hours',
      colour: '#c0491f',
      escalationRule: 'Escalate immediately to manager',
      status: true
    },
    {
      priorityCode: 'PRI-1005',
      priorityName: 'Emergency',
      responseTime: '15 Minutes',
      completionSla: '2 Hours',
      colour: '#c0221f',
      escalationRule: 'Immediate escalation to director',
      status: true
    }
  ];

  private nextSequence = 1006;

  getRecords(): InspectionPriorityItem[] {
    return this.records;
  }

  addRecord(record: InspectionPriorityItem): InspectionPriorityItem {
    const priorityCode = record.priorityCode?.trim() || `PRI-${this.nextSequence++}`;
    const created: InspectionPriorityItem = { ...record, priorityCode };
    this.records.push(created);
    return created;
  }

  updateRecord(priorityCode: string, changes: InspectionPriorityItem): void {
    const index = this.records.findIndex((r) => r.priorityCode === priorityCode);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(priorityCodes: string[]): void {
    for (const code of priorityCodes) {
      const index = this.records.findIndex((r) => r.priorityCode === code);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): InspectionPriorityItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
