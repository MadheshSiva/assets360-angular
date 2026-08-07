import { Injectable } from '@angular/core';
import { InspectionSeverityItem } from './severity.model';

@Injectable({ providedIn: 'root' })
export class InspectionSeverityService {
  readonly severityNameMaster: string[] = ['Informational', 'Low', 'Medium', 'High', 'Critical'];
  readonly escalationLevelMaster: string[] = ['None', 'Level 1', 'Level 2', 'Level 3'];

  private readonly records: InspectionSeverityItem[] = [
    {
      severityCode: 'SEV-1001',
      severityName: 'Informational',
      score: 1,
      colourIndicator: '#64748b',
      resolutionSla: 'None',
      escalationLevel: 'None',
      status: true
    },
    {
      severityCode: 'SEV-1002',
      severityName: 'Low',
      score: 2,
      colourIndicator: '#1e7e34',
      resolutionSla: '72 Hours',
      escalationLevel: 'Level 1',
      status: true
    },
    {
      severityCode: 'SEV-1003',
      severityName: 'Medium',
      score: 3,
      colourIndicator: '#b8860b',
      resolutionSla: '24 Hours',
      escalationLevel: 'Level 1',
      status: true
    },
    {
      severityCode: 'SEV-1004',
      severityName: 'High',
      score: 4,
      colourIndicator: '#c0491f',
      resolutionSla: '4 Hours',
      escalationLevel: 'Level 2',
      status: true
    },
    {
      severityCode: 'SEV-1005',
      severityName: 'Critical',
      score: 5,
      colourIndicator: '#c0221f',
      resolutionSla: '1 Hour',
      escalationLevel: 'Level 3',
      status: true
    }
  ];

  private nextSequence = 1006;

  getRecords(): InspectionSeverityItem[] {
    return this.records;
  }

  addRecord(record: InspectionSeverityItem): InspectionSeverityItem {
    const severityCode = record.severityCode?.trim() || `SEV-${this.nextSequence++}`;
    const created: InspectionSeverityItem = { ...record, severityCode };
    this.records.push(created);
    return created;
  }

  updateRecord(severityCode: string, changes: InspectionSeverityItem): void {
    const index = this.records.findIndex((r) => r.severityCode === severityCode);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(severityCodes: string[]): void {
    for (const code of severityCodes) {
      const index = this.records.findIndex((r) => r.severityCode === code);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): InspectionSeverityItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
