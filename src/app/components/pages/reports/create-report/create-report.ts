import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface TreeNode {
  label: string;
  expanded?: boolean;
  active?: boolean;
  children?: TreeNode[];
}

type ReportModule =
  | 'visitor'
  | 'attendance'
  | 'ot'
  | 'meal'
  | 'patrol'
  | 'supervision'
  | 'analytics'
  | 'evacuation';

type ReportFormat = 'url' | 'pdf' | 'csv';
type Recurrence = 'once' | 'daily' | 'weekly' | 'monthly';
type TimeRangePreset = '1h' | '2h' | '4h' | '8h' | '24h' | 'custom';

@Component({
  standalone: true,
  selector: 'app-create-report',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-report.html',
  styleUrls: ['./create-report.css']
})
export class CreateReport {
  constructor(private router: Router) {}

  // ---- Breadcrumb navigation ----
  navigateToReport(): void {
    // Adjust the path below to match your app's actual route for the Report list page
    this.router.navigate(['/report']);
  }

  // ---- Left navigation tree ----
  searchTerm = '';

  treeNodes: TreeNode[] = [
    {
      label: 'Track People',
      expanded: true,
      children: [
        {
          label: 'UAE',
          expanded: true,
          children: [
            {
              label: 'Oman',
              expanded: true,
              children: [
                {
                  label: 'Street One',
                  expanded: true,
                  children: [
                    {
                      label: 'Second Colony',
                      expanded: true,
                      children: [
                        {
                          label: 'Third Right',
                          expanded: true,
                          children: [{ label: 'Azy floor', active: true }]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  toggleNode(node: TreeNode): void {
    if (node.children?.length) {
      node.expanded = !node.expanded;
    }
  }

  // ---- Connection / status strip ----
  connectionStatus = { online: true };
  gatewayStats = {
    totalGateway: 24,
    fixedSensor: 118,
    mobileSensor: 46,
    alarms: 3
  };

  // ---- Time range ----
  timeRangePreset: TimeRangePreset = '2h';

  timeRangePresets: { value: TimeRangePreset; label: string }[] = [
    { value: '1h', label: '1 Hours' },
    { value: '2h', label: '2 Hours' },
    { value: '4h', label: '4 Hours' },
    { value: '8h', label: '8 Hours' },
    { value: '24h', label: '24 Hours' }
  ];

  selectTimeRange(preset: TimeRangePreset): void {
    this.timeRangePreset = preset;
  }

  // ---- Report form state ----
  reportName = '';

  selectedModule: ReportModule | null = null;

  moduleOptions: { value: ReportModule; label: string }[] = [
    { value: 'visitor', label: 'Visitor & Entrance Management' },
    { value: 'attendance', label: 'Attendance' },
    { value: 'ot', label: 'OT Management' },
    { value: 'meal', label: 'Meal Management' },
    { value: 'patrol', label: 'Patrol Management' },
    { value: 'supervision', label: 'Personal Supervision' },
    { value: 'analytics', label: 'Customer Analytics' },
    { value: 'evacuation', label: 'Evacuation' }
  ];

  selectedTemplate = '';
  templateOptions: string[] = [];

  // ---- Format ----
  format: ReportFormat = 'url';
  downloadCsvAlso = false;

  // ---- Recurrence ----
  recurrence: Recurrence = 'once';
  dailyTime = '';
  weeklyDay = 'Monday';
  weeklyTime = '';
  monthlyDate = '';
  monthlyTime = '';

  weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // ---- Share with ----
  shareWith = '';

  selectModule(value: ReportModule): void {
    this.selectedModule = value;
  }

  setFormat(value: ReportFormat): void {
    this.format = value;
  }

  setRecurrence(value: Recurrence): void {
    this.recurrence = value;
  }

  get isFormValid(): boolean {
    return !!this.reportName.trim() && !!this.selectedModule;
  }

  onCreateReport(): void {
    if (!this.isFormValid) {
      return;
    }

    const payload = {
      reportName: this.reportName,
      module: this.selectedModule,
      template: this.selectedTemplate,
      timeRangePreset: this.timeRangePreset,
      format: this.format,
      downloadCsvAlso: this.downloadCsvAlso,
      recurrence: this.recurrence,
      dailyTime: this.dailyTime,
      weeklyDay: this.weeklyDay,
      weeklyTime: this.weeklyTime,
      monthlyDate: this.monthlyDate,
      monthlyTime: this.monthlyTime,
      shareWith: this.shareWith
        .split(',')
        .map(email => email.trim())
        .filter(Boolean)
    };

    // Replace with actual API call, e.g. this.reportService.create(payload)
    console.log('Create report payload', payload);
  }

  onCancel(): void {
    this.reportName = '';
    this.selectedModule = null;
    this.selectedTemplate = '';
    this.format = 'url';
    this.downloadCsvAlso = false;
    this.recurrence = 'once';
    this.dailyTime = '';
    this.weeklyDay = 'Monday';
    this.weeklyTime = '';
    this.monthlyDate = '';
    this.monthlyTime = '';
    this.shareWith = '';
  }
}