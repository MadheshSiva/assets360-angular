import { Injectable } from '@angular/core';
import { MaterialConsumption } from './material-consumption.model';
import { JobMasterService } from '../job-master/job-master.service';
import { TaskMasterService } from '../task-master/task-master.service';

@Injectable({ providedIn: 'root' })
export class MaterialConsumptionService {
  readonly unitMaster: string[] = ['Each', 'Box', 'Set', 'Meter', 'Liter', 'Kg'];

  readonly vendorMaster: { id: string; name: string }[] = [
    { id: 'VEN-001', name: 'ABC Traders' },
    { id: 'VEN-002', name: 'Gulf Spares Co.' },
    { id: 'VEN-003', name: 'Prime Industrial Supplies' }
  ];

  constructor(
    private jobMasterService: JobMasterService,
    private taskMasterService: TaskMasterService
  ) {}

  get jobMaster() {
    return this.jobMasterService.getJobs();
  }

  tasksForJob(jobId: string) {
    return this.taskMasterService.getTasks().filter((t) => t.jobId === jobId);
  }

  taskName(taskId: string): string {
    return this.taskMasterService.getTasks().find((t) => t.taskId === taskId)?.taskName ?? taskId;
  }

  private readonly records: MaterialConsumption[] = [
    {
      materialId: 'MTC-1001',
      jobId: 'b3f1c2a0-1e2d-4f3a-9b8c-1a2b3c4d5e6f',
      taskId: 'TSK-1002',
      itemName: 'HVAC Filter 24x24',
      itemCode: 'ITM-HVAC-2424',
      quantityPlanned: 20,
      quantityUsed: 18,
      unit: 'Each',
      cost: 12.5,
      vendorId: 'VEN-002'
    },
    {
      materialId: 'MTC-1002',
      jobId: 'a7d4e5f6-2b3c-4d5e-8f9a-0b1c2d3e4f5a',
      taskId: '',
      itemName: 'Fire Panel Fuse',
      itemCode: 'ITM-FP-FUSE',
      quantityPlanned: 5,
      quantityUsed: 2,
      unit: 'Each',
      cost: 8,
      vendorId: 'VEN-001'
    }
  ];

  private nextSequence = 1003;

  getRecords(): MaterialConsumption[] {
    return this.records;
  }

  addRecord(record: MaterialConsumption): MaterialConsumption {
    const materialId = record.materialId || `MTC-${this.nextSequence++}`;
    const created: MaterialConsumption = { ...record, materialId };
    this.records.push(created);
    return created;
  }

  updateRecord(materialId: string, changes: MaterialConsumption): void {
    const index = this.records.findIndex((r) => r.materialId === materialId);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(materialIds: string[]): void {
    for (const id of materialIds) {
      const index = this.records.findIndex((r) => r.materialId === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): MaterialConsumption[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
