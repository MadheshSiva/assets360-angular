import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface UtilizationPerformanceEntry {
  usageHours: string;
  idleTime: string;
  movementFrequency: string;
  utilizationPercent: string;
  productivityMetrics: string;
}

@Component({
  standalone: true,
  selector: 'app-asset-utilization-performance',
  imports: [CommonModule],
  templateUrl: './utilization-performance.html',
  styleUrls: ['./utilization-performance.css']
})
export class AssetUtilizationPerformance {
  entries: UtilizationPerformanceEntry[] = [
    {
      usageHours: '128 hrs this month',
      idleTime: '14 hrs',
      movementFrequency: '36 moves this month',
      utilizationPercent: '82%',
      productivityMetrics: 'Above target'
    },
    {
      usageHours: '96 hrs this month',
      idleTime: '22 hrs',
      movementFrequency: '18 moves this month',
      utilizationPercent: '64%',
      productivityMetrics: 'On target'
    }
  ];

  onAdd(): void {
    // TODO: open add utilization & performance entry flow
  }

  onUpload(): void {
    // TODO: trigger file upload (e.g. bulk import via Excel/CSV)
  }

  onDownload(): void {
    // TODO: export current utilization & performance list
  }

  onRefresh(): void {
    // TODO: reload utilization & performance data from backend
  }

  onDelete(): void {
    // TODO: delete selected entries
  }
}
