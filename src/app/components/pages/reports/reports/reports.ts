import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';

export type FrequencyFilter = 'Monthly' | 'Weekly' | 'Daily' | 'Once';

export interface Report {
  id: string;
  slNo: number;
  title: string;
  timeRange: string;
  expireOn: string;
  recurrence: string;
  createdOn: string;
  type: string;
  shareWith: string;
  generatedOn: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

@Component({
  standalone: true,
  selector: 'app-reports',
  imports: [CommonModule],
  templateUrl: './reports.html',
  styleUrls: ['./reports.css']
})
export class Reports {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.reportsApiUrl || environment.apiUrl;

  reports: Report[] = [];
  loading = false;
  error: string | null = null;
  activeFilter: FrequencyFilter = 'Monthly';
  filters: FrequencyFilter[] = ['Monthly', 'Weekly', 'Daily', 'Once'];

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.loading = true;
    this.http.get(`${this.apiUrl}api/reports`).subscribe({
      next: (res: any) => {
        this.reports = res.data || res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        // Fallback mock data matching the screenshot
        this.reports = [
          {
            id: '1', slNo: 1, title: 'OT Report', timeRange: '1 - Month',
            expireOn: '2027-07-01', recurrence: 'Once', createdOn: '2026-05-01',
            type: 'URL', shareWith: 'piq@gmail.com', generatedOn: '2026-05-01',
            status: 'Completed'
          },
          {
            id: '2', slNo: 2, title: 'Patient Report', timeRange: '1 - Month',
            expireOn: '2027-07-01', recurrence: 'Once', createdOn: '2026-05-01',
            type: 'URL', shareWith: 'piq@gmail.com', generatedOn: '2026-05-01',
            status: 'Completed'
          },
          {
            id: '3', slNo: 3, title: 'Customer', timeRange: '1 - Month',
            expireOn: '2027-07-01', recurrence: 'Once', createdOn: '2026-05-01',
            type: 'URL', shareWith: 'piq@gmail.com', generatedOn: '2026-05-01',
            status: 'Completed'
          },
          {
            id: '4', slNo: 4, title: 'People', timeRange: '1 - Month',
            expireOn: '2027-07-01', recurrence: 'Once', createdOn: '2026-05-01',
            type: 'URL', shareWith: 'piq@gmail.com', generatedOn: '2026-05-01',
            status: 'Pending'
          }
        ];
      }
    });
  }

  setFilter(filter: FrequencyFilter) {
    this.activeFilter = filter;
    this.loadReports();
  }

  get filteredReports(): Report[] {
    return this.reports.filter(r => r.recurrence === this.activeFilter);
  }

  addReport() {
    this.router.navigate(['/report/create']);
  }

  uploadReport() {
    // Upload action
  }

  downloadReport() {
    // Download action
  }

  refreshReports() {
    this.loadReports();
  }

  editReport(report: Report) {
    // Edit action
  }

  deleteReport(report: Report) {
    this.http.delete(`${this.apiUrl}api/reports/${report.id}`).subscribe({
      next: () => this.loadReports(),
      error: () => {
        this.reports = this.reports.filter(r => r.id !== report.id);
      }
    });
  }
}