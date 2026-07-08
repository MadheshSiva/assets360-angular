import { Injectable } from '@angular/core';
import { JobMaster } from './job-master.model';
import { ChecklistMasterService } from '../checklist-master/checklist-master.service';
import { AssetLinkingService } from '../asset-linking/asset-linking.service';
import { SlaMasterService } from '../sla-master/sla-master.service';

@Injectable({ providedIn: 'root' })
export class JobMasterService {
  constructor(
    private checklistMasterService: ChecklistMasterService,
    private assetLinkingService: AssetLinkingService,
    private slaMasterService: SlaMasterService
  ) {}

  get assetMaster(): { id: string; name: string }[] {
    return this.assetLinkingService.getAssets().map((a) => ({ id: a.assetId, name: a.assetName }));
  }

  readonly assetCategoryMaster: string[] = ['Mechanical', 'Electrical', 'HVAC', 'Fire Safety', 'IT'];

  readonly locationMaster: string[] = [
    'Dubai Mall - Ground Floor',
    'Marina Mall - Tower A',
    'Warehouse B',
    'Main Plant'
  ];

  readonly departmentMaster: string[] = ['Facilities', 'Electrical', 'Mechanical', 'IT', 'Safety'];
  readonly workTypeMaster: string[] = ['Preventive', 'Corrective', 'Predictive', 'Inspection'];
  readonly priorityMaster: string[] = ['Low', 'Medium', 'High', 'Critical'];
  readonly statusMaster: string[] = ['Open', 'In Progress', 'On Hold', 'Completed', 'Closed'];

  readonly userMaster: { id: string; name: string }[] = [
    { id: 'USR-001', name: 'John Mathew' },
    { id: 'USR-002', name: 'Ali Hassan' },
    { id: 'USR-003', name: 'Priya Nair' },
    { id: 'USR-004', name: 'Carlos Diaz' }
  ];

  get slaMaster(): { id: string; name: string }[] {
    return this.slaMasterService.getSlas().map((s) => ({ id: s.slaId, name: s.slaName }));
  }

  get checklistMaster(): { id: string; name: string }[] {
    return this.checklistMasterService.getChecklists().map((c) => ({ id: c.checklistId, name: c.checklistName }));
  }

  private jobs: JobMaster[] = [
    {
      jobId: 'b3f1c2a0-1e2d-4f3a-9b8c-1a2b3c4d5e6f',
      jobName: 'Quarterly HVAC Filter Replacement',
      description: 'Replace filters across ground floor HVAC units',
      assetId: 'AST-1001',
      assetCategory: 'HVAC',
      locationId: 'Dubai Mall - Ground Floor',
      departmentId: 'Facilities',
      workType: 'Preventive',
      priority: 'Medium',
      plannedStartDate: '2026-06-10',
      plannedEndDate: '2026-06-10',
      actualStartDate: '',
      actualEndDate: '',
      status: 'Open',
      assignedTo: ['USR-001'],
      supervisorId: 'USR-003',
      slaId: 'SLA-002',
      progressPercentage: 0,
      downtimeRequired: false,
      permitRequired: false,
      safetyChecklistId: 'CHK-001',
      remarks: ''
    },
    {
      jobId: 'a7d4e5f6-2b3c-4d5e-8f9a-0b1c2d3e4f5a',
      jobName: 'Fire Panel Fault Reset',
      description: 'Investigate and reset fire panel fault at Tower A',
      assetId: 'AST-1002',
      assetCategory: 'Fire Safety',
      locationId: 'Marina Mall - Tower A',
      departmentId: 'Electrical',
      workType: 'Corrective',
      priority: 'Critical',
      plannedStartDate: '2026-06-15',
      plannedEndDate: '2026-06-15',
      actualStartDate: '2026-06-15',
      actualEndDate: '',
      status: 'In Progress',
      assignedTo: ['USR-002'],
      supervisorId: 'USR-003',
      slaId: 'SLA-001',
      progressPercentage: 40,
      downtimeRequired: true,
      permitRequired: true,
      safetyChecklistId: 'CHK-002',
      remarks: 'Awaiting vendor callback'
    }
  ];

  private generateJobId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `JOB-${Date.now()}`;
  }

  getJobs(): JobMaster[] {
    return this.jobs;
  }

  addRecord(record: JobMaster): JobMaster {
    const jobId = record.jobId?.trim() ? record.jobId.trim() : this.generateJobId();
    const created: JobMaster = { ...record, jobId };
    this.jobs.push(created);
    return created;
  }

  updateRecord(jobId: string, changes: JobMaster): void {
    const index = this.jobs.findIndex((j) => j.jobId === jobId);
    if (index !== -1) {
      this.jobs[index] = { ...this.jobs[index], ...changes };
    }
  }

  deleteRecords(jobIds: string[]): void {
    this.jobs = this.jobs.filter((j) => !jobIds.includes(j.jobId));
  }

  search(term: string): JobMaster[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.jobs;
    return this.jobs.filter((j) =>
      Object.values(j).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
