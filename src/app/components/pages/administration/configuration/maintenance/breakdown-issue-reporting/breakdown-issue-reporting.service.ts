import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BreakdownIssueRecord } from './breakdown-issue-reporting.model';

/**
 * Standalone data/master layer for the Breakdown / Issue Reporting sub-module, kept
 * independent of the other Maintenance sub-modules so it can be pointed at its own
 * backend microservice without touching the rest of the Maintenance feature set.
 */
@Injectable({ providedIn: 'root' })
export class BreakdownIssueReportingService {
  readonly userMaster: string[] = ['John Mathew', 'Ali Hassan', 'Priya Nair', 'Site Supervisor'];
  readonly issueTypeMaster: string[] = [
    'Mechanical Failure',
    'Electrical Fault',
    'Software Glitch',
    'Safety Hazard',
    'Other'
  ];
  readonly severityMaster: string[] = ['Low', 'Medium', 'High', 'Critical'];

  private readonly issuesSubject = new BehaviorSubject<BreakdownIssueRecord[]>([
    {
      issueId: 'ISS-3001',
      reportedBy: 'Ali Hassan',
      issueType: 'Electrical Fault',
      severity: 'Critical',
      description: 'Fire panel showing continuous fault alarm on Zone 3.',
      attachments: [],
      rootCause: 'Loose wiring at the zone 3 terminal block.',
      resolutionAction: 'Re-terminated wiring and reset the panel.'
    },
    {
      issueId: 'ISS-3002',
      reportedBy: 'Priya Nair',
      issueType: 'Mechanical Failure',
      severity: 'Medium',
      description: 'Unusual noise from Chiller Pump 2 during operation.',
      attachments: [],
      rootCause: '',
      resolutionAction: ''
    }
  ]);

  private nextSequence = 3003;

  getIssues(): BreakdownIssueRecord[] {
    return this.issuesSubject.value;
  }

  addIssue(issue: BreakdownIssueRecord): BreakdownIssueRecord {
    const issueId = issue.issueId || `ISS-${this.nextSequence++}`;
    const created: BreakdownIssueRecord = { ...issue, issueId };
    this.issuesSubject.next([...this.issuesSubject.value, created]);
    return created;
  }

  updateIssue(issueId: string, changes: BreakdownIssueRecord): void {
    this.issuesSubject.next(
      this.issuesSubject.value.map((i) => (i.issueId === issueId ? { ...i, ...changes } : i))
    );
  }

  deleteIssues(issueIds: string[]): void {
    this.issuesSubject.next(this.issuesSubject.value.filter((i) => !issueIds.includes(i.issueId)));
  }

  search(term: string): BreakdownIssueRecord[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.issuesSubject.value;
    return this.issuesSubject.value.filter((i) =>
      [
        i.issueId,
        i.reportedBy,
        i.issueType,
        i.severity,
        i.description,
        i.rootCause,
        i.resolutionAction,
        i.attachments.join(', ')
      ].some((v) => v.toLowerCase().includes(value))
    );
  }
}
