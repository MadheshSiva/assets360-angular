import { Injectable } from '@angular/core';
import { IssueDelay, IssueDelayType, IssueDelaySeverity } from './issue-delay.model';
import { JobMasterService } from '../job-master/job-master.service';
import { TaskMasterService } from '../task-master/task-master.service';
import { StatusMasterService } from '../status-master/status-master.service';

@Injectable({ providedIn: 'root' })
export class IssueDelayService {
  readonly issueTypeMaster: IssueDelayType[] = ['Technical', 'Resource', 'Material', 'External'];
  readonly severityMaster: IssueDelaySeverity[] = ['Low', 'Medium', 'High', 'Critical'];

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

  private issues: IssueDelay[] = [
    {
      issueId: 'ISD-1001',
      jobId: 'b3f1c2a0-1e2d-4f3a-9b8c-1a2b3c4d5e6f',
      taskId: 'TSK-1001',
      issueType: 'Technical',
      description: 'Replacement filter size mismatch discovered on-site',
      reportedBy: 'USR-001',
      reportedDate: '2026-06-10',
      severity: 'Medium',
      statusId: 'STS-1003',
      resolutionRemarks: '',
      closedDate: ''
    },
    {
      issueId: 'ISD-1002',
      jobId: 'a7d4e5f6-2b3c-4d5e-8f9a-0b1c2d3e4f5a',
      taskId: '',
      issueType: 'External',
      description: 'Awaiting vendor callback for fire panel spare part',
      reportedBy: 'USR-002',
      reportedDate: '2026-06-15',
      severity: 'High',
      statusId: 'STS-1004',
      resolutionRemarks: '',
      closedDate: ''
    }
  ];

  private nextSequence = 1003;

  getIssues(): IssueDelay[] {
    return this.issues;
  }

  addRecord(record: IssueDelay): IssueDelay {
    const issueId = record.issueId || `ISD-${this.nextSequence++}`;
    const created: IssueDelay = { ...record, issueId };
    this.issues = [...this.issues, created];
    return created;
  }

  updateRecord(issueId: string, changes: IssueDelay): void {
    this.issues = this.issues.map((i) => (i.issueId === issueId ? { ...i, ...changes } : i));
  }

  deleteRecords(issueIds: string[]): void {
    this.issues = this.issues.filter((i) => !issueIds.includes(i.issueId));
  }

  search(term: string): IssueDelay[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.issues;
    return this.issues.filter((i) =>
      Object.values(i).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
