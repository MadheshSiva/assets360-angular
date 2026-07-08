import { Injectable } from '@angular/core';
import { ProgressLog, ProgressLogUpdateSource } from './progress-log.model';
import { JobMasterService } from '../job-master/job-master.service';
import { TaskMasterService } from '../task-master/task-master.service';
import { StatusMasterService } from '../status-master/status-master.service';

@Injectable({ providedIn: 'root' })
export class ProgressLogService {
  readonly updateSourceMaster: ProgressLogUpdateSource[] = ['Manual', 'IoT', 'API'];

  constructor(
    private jobMasterService: JobMasterService,
    private taskMasterService: TaskMasterService,
    private statusMasterService: StatusMasterService
  ) {}

  get jobMaster() {
    return this.jobMasterService.getJobs();
  }

  get userMaster() {
    return this.jobMasterService.userMaster;
  }

  get statusMaster() {
    return this.statusMasterService.getStatuses();
  }

  tasksForJob(jobId: string) {
    return this.taskMasterService.getTasks().filter((t) => t.jobId === jobId);
  }

  taskName(taskId: string): string {
    return this.taskMasterService.getTasks().find((t) => t.taskId === taskId)?.taskName ?? taskId;
  }

  private records: ProgressLog[] = [
    {
      logId: 'PLG-1001',
      jobId: 'b3f1c2a0-1e2d-4f3a-9b8c-1a2b3c4d5e6f',
      taskId: 'TSK-1001',
      timestamp: '2026-06-10T09:15',
      progressPercentage: 20,
      statusId: 'STS-1003',
      updatedBy: 'USR-001',
      updateSource: 'Manual',
      remarks: 'Old filters removed',
      sensorData: ''
    },
    {
      logId: 'PLG-1002',
      jobId: 'a7d4e5f6-2b3c-4d5e-8f9a-0b1c2d3e4f5a',
      taskId: '',
      timestamp: '2026-06-15T11:30',
      progressPercentage: 40,
      statusId: 'STS-1003',
      updatedBy: 'USR-002',
      updateSource: 'IoT',
      remarks: 'Fault reading updated automatically',
      sensorData: '{"voltage": 0.4, "unit": "V"}'
    }
  ];

  private nextSequence = 1003;

  getRecords(): ProgressLog[] {
    return this.records;
  }

  addRecord(record: ProgressLog): ProgressLog {
    const logId = record.logId || `PLG-${this.nextSequence++}`;
    const created: ProgressLog = { ...record, logId };
    this.records = [...this.records, created];
    return created;
  }

  updateRecord(logId: string, changes: ProgressLog): void {
    this.records = this.records.map((r) => (r.logId === logId ? { ...r, ...changes } : r));
  }

  deleteRecords(logIds: string[]): void {
    this.records = this.records.filter((r) => !logIds.includes(r.logId));
  }

  search(term: string): ProgressLog[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
