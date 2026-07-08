import { Injectable } from '@angular/core';
import { SlaMaster } from './sla-master.model';

@Injectable({ providedIn: 'root' })
export class SlaMasterService {
  readonly workTypeMaster: string[] = ['Preventive', 'Corrective', 'Predictive', 'Inspection'];
  readonly priorityMaster: string[] = ['Low', 'Medium', 'High', 'Critical'];

  readonly userMaster: { id: string; name: string }[] = [
    { id: 'USR-001', name: 'John Mathew' },
    { id: 'USR-002', name: 'Ali Hassan' },
    { id: 'USR-003', name: 'Priya Nair' },
    { id: 'USR-004', name: 'Carlos Diaz' }
  ];

  private readonly slas: SlaMaster[] = [
    {
      slaId: 'SLA-001',
      slaName: '4 Hour Response',
      workType: 'Corrective',
      priority: 'Critical',
      responseTimeMins: 240,
      resolutionTimeMins: 480,
      escalationLevel1: 'USR-001',
      escalationLevel2: 'USR-003',
      escalationLevel3: 'USR-004'
    },
    {
      slaId: 'SLA-002',
      slaName: '24 Hour Resolution',
      workType: 'Preventive',
      priority: 'Medium',
      responseTimeMins: 480,
      resolutionTimeMins: 1440,
      escalationLevel1: 'USR-002',
      escalationLevel2: 'USR-003',
      escalationLevel3: ''
    }
  ];

  private nextSequence = 3;

  getSlas(): SlaMaster[] {
    return this.slas;
  }

  addRecord(record: SlaMaster): SlaMaster {
    const slaId = record.slaId || `SLA-${String(this.nextSequence++).padStart(3, '0')}`;
    const created: SlaMaster = { ...record, slaId };
    this.slas.push(created);
    return created;
  }

  updateRecord(slaId: string, changes: SlaMaster): void {
    const index = this.slas.findIndex((s) => s.slaId === slaId);
    if (index !== -1) {
      this.slas[index] = { ...this.slas[index], ...changes };
    }
  }

  deleteRecords(slaIds: string[]): void {
    for (const id of slaIds) {
      const index = this.slas.findIndex((s) => s.slaId === id);
      if (index !== -1) {
        this.slas.splice(index, 1);
      }
    }
  }

  search(term: string): SlaMaster[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.slas;
    return this.slas.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
