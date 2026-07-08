import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PermitCompliance, PermitType, PermitStatus } from './permit-compliance.model';
import { JobMasterService } from '../job-master/job-master.service';

@Injectable({ providedIn: 'root' })
export class PermitComplianceService {
  readonly permitTypeMaster: PermitType[] = ['Electrical', 'Confined Space', 'Hot Work'];
  readonly statusMaster: PermitStatus[] = ['Active', 'Expired', 'Revoked', 'Pending Approval'];

  constructor(private jobMasterService: JobMasterService) {}

  get jobMaster() {
    return this.jobMasterService.getJobs();
  }

  get userMaster() {
    return this.jobMasterService.userMaster;
  }

  private readonly recordsSubject = new BehaviorSubject<PermitCompliance[]>([
    {
      permitId: 'PMC-1001',
      jobId: 'a7d4e5f6-2b3c-4d5e-8f9a-0b1c2d3e4f5a',
      permitType: 'Electrical',
      issuedBy: 'USR-003',
      approvedBy: 'USR-004',
      validFrom: '2026-06-14',
      validTo: '2026-06-16',
      status: 'Active',
      documentAttachment: ''
    },
    {
      permitId: 'PMC-1002',
      jobId: 'b3f1c2a0-1e2d-4f3a-9b8c-1a2b3c4d5e6f',
      permitType: 'Hot Work',
      issuedBy: 'USR-003',
      approvedBy: 'USR-004',
      validFrom: '2026-06-08',
      validTo: '2026-06-10',
      status: 'Expired',
      documentAttachment: ''
    }
  ]);

  private nextSequence = 1003;

  getRecords(): PermitCompliance[] {
    return this.recordsSubject.value;
  }

  addRecord(record: PermitCompliance): PermitCompliance {
    const permitId = record.permitId || `PMC-${this.nextSequence++}`;
    const created: PermitCompliance = { ...record, permitId };
    this.recordsSubject.next([...this.recordsSubject.value, created]);
    return created;
  }

  updateRecord(permitId: string, changes: PermitCompliance): void {
    this.recordsSubject.next(
      this.recordsSubject.value.map((r) => (r.permitId === permitId ? { ...r, ...changes } : r))
    );
  }

  deleteRecords(permitIds: string[]): void {
    this.recordsSubject.next(this.recordsSubject.value.filter((r) => !permitIds.includes(r.permitId)));
  }

  search(term: string): PermitCompliance[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.recordsSubject.value;
    return this.recordsSubject.value.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
