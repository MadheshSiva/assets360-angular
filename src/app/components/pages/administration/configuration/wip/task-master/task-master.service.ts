import { Injectable } from '@angular/core';
import { TaskMaster } from './task-master.model';
import { JobMasterService } from '../job-master/job-master.service';
import { StatusMasterService } from '../status-master/status-master.service';

@Injectable({ providedIn: 'root' })
export class TaskMasterService {
  constructor(
    private jobMasterService: JobMasterService,
    private statusMasterService: StatusMasterService
  ) {}

  get jobMaster() {
    return this.jobMasterService.getJobs();
  }

  get userMaster() {
    return this.jobMasterService.userMaster;
  }

  get checklistMaster() {
    return this.jobMasterService.checklistMaster;
  }

  get statusMaster() {
    return this.statusMasterService.getStatuses();
  }

  private readonly tasks: TaskMaster[] = [
    {
      taskId: 'TSK-1001',
      jobId: 'b3f1c2a0-1e2d-4f3a-9b8c-1a2b3c4d5e6f',
      taskName: 'Remove old filters',
      description: 'Remove and dispose of old HVAC filters across ground floor units',
      sequenceOrder: 1,
      assignedTo: 'USR-001',
      plannedStartTime: '2026-06-10T09:00',
      plannedEndTime: '2026-06-10T10:00',
      actualStartTime: '',
      actualEndTime: '',
      statusId: 'STS-1001',
      dependencyTaskId: '',
      checklistId: 'CHK-001',
      completionPercentage: 0,
      remarks: ''
    },
    {
      taskId: 'TSK-1002',
      jobId: 'b3f1c2a0-1e2d-4f3a-9b8c-1a2b3c4d5e6f',
      taskName: 'Install new filters',
      description: 'Install replacement filters and verify airflow',
      sequenceOrder: 2,
      assignedTo: 'USR-001',
      plannedStartTime: '2026-06-10T10:00',
      plannedEndTime: '2026-06-10T11:00',
      actualStartTime: '',
      actualEndTime: '',
      statusId: 'STS-1001',
      dependencyTaskId: 'TSK-1001',
      checklistId: 'CHK-001',
      completionPercentage: 0,
      remarks: ''
    }
  ];

  private nextSequence = 1003;

  getTasks(): TaskMaster[] {
    return this.tasks;
  }

  addRecord(record: TaskMaster): TaskMaster {
    const taskId = record.taskId && record.taskId.trim() ? record.taskId.trim() : `TSK-${this.nextSequence++}`;
    const created: TaskMaster = { ...record, taskId };
    this.tasks.push(created);
    return created;
  }

  updateRecord(taskId: string, changes: TaskMaster): void {
    const index = this.tasks.findIndex((t) => t.taskId === taskId);
    if (index !== -1) {
      this.tasks[index] = { ...this.tasks[index], ...changes };
    }
  }

  deleteRecords(taskIds: string[]): void {
    for (const id of taskIds) {
      const index = this.tasks.findIndex((t) => t.taskId === id);
      if (index !== -1) {
        this.tasks.splice(index, 1);
      }
    }
  }

  search(term: string): TaskMaster[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.tasks;
    return this.tasks.filter((t) =>
      Object.values(t).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
