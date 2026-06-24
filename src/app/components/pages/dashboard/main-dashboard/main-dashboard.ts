import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatCard {
  label: string;
  value: string;
  iconColor: string;
  change?: string;
  changeDirection?: 'up' | 'down';
  subLabel?: string;
  badge?: string;
  live?: boolean;
}

interface DonutLegendItem {
  label: string;
  value: string;
  percentage: string;
  color: string;
}

interface AlertItem {
  type: string;
  asset: string;
  time: string;
  severity: string;
}

interface GeofenceItem {
  name: string;
  assetsInside: number;
  alerts: number;
}

interface ActivityItem {
  assetId: string;
  assetName: string;
  route: string;
  status: string;
  location: string;
  speed: string;
  lastUpdate: string;
  live: boolean;
  thumbColor: string;
}

interface ActiveAsset {
  assetId: string;
  route: string;
  speed: string;
  speedPercent: number;
  thumbColor: string;
}

interface DistanceAsset {
  rank: number;
  assetId: string;
  name: string;
  distance: string;
}

interface DashboardData {
  statCards: StatCard[];
  assetStatusDonut: { total: string; totalLabel: string; legend: DonutLegendItem[] };
  assetsByTypeDonut: { total: string; totalLabel: string; legend: DonutLegendItem[] };
  recentAlerts: AlertItem[];
  utilizationChart: { yAxisLabels: string[]; xAxisLabels: string[]; peak: { value: string; x: number; y: number }; linePoints: string };
  geofenceSummary: GeofenceItem[];
  recentActivity: ActivityItem[];
  topActiveAssets: ActiveAsset[];
  topAssetsByDistance: DistanceAsset[];
}

@Component({
  standalone: true,
  selector: 'app-main-dashboard',
  imports: [CommonModule],
  templateUrl: './main-dashboard.html',
  styleUrls: ['./main-dashboard.css'],
})
export class MainDashboard implements OnInit {
  statCards: StatCard[] = [];
  assetStatusDonut: DashboardData['assetStatusDonut'] = { total: '', totalLabel: '', legend: [] };
  assetsByTypeDonut: DashboardData['assetsByTypeDonut'] = { total: '', totalLabel: '', legend: [] };
  recentAlerts: AlertItem[] = [];
  utilizationData: DashboardData['utilizationChart'] = { yAxisLabels: [], xAxisLabels: [], peak: { value: '', x: 0, y: 0 }, linePoints: '' };
  geofenceSummary: GeofenceItem[] = [];
  recentActivity: ActivityItem[] = [];
  topActiveAssets: ActiveAsset[] = [];
  topAssetsByDistance: DistanceAsset[] = [];

  // Popup (click on stat cards)
  isStatPopupOpen = false;
  statPopupTitle = '';
  statPopupRows: Array<Record<string, string | number>> = [];

  constructor(private cd: ChangeDetectorRef) {}
  async ngOnInit(): Promise<void> {
    const response = await fetch('/assets/data/dashboard-data.json');

    const data: DashboardData = await response.json();
    console.log('Dashboard data loaded:', data);
    this.statCards = data?.statCards;
    this.assetStatusDonut = data?.assetStatusDonut;
    this.assetsByTypeDonut = data?.assetsByTypeDonut;
    this.recentAlerts = data?.recentAlerts;
    this.utilizationData = data?.utilizationChart;
    this.geofenceSummary = data?.geofenceSummary;
    this.recentActivity = data?.recentActivity;
    this.topActiveAssets = data?.topActiveAssets;
    this.topAssetsByDistance = data?.topAssetsByDistance;

    this.cd.detectChanges(); 
  }

  getStatCardClass(index: number): string {
    const classes = ['blue-card', 'green-card', 'purple-card', 'orange-card', 'red-card'];
    return classes[index] || '';
  }

  getAlertBgClass(severity: string): string {
    const map: Record<string, string> = {
      red: 'red-bg',
      orange: 'orange-bg',
      purple: 'purple-bg',
      yellow: 'yellow-bg',
      gray: 'gray-bg',
    };
    return map[severity] || 'gray-bg';
  }

  getAlertTextClass(severity: string): string {
    const map: Record<string, string> = {
      red: 'red-text',
      orange: 'orange-text',
      purple: 'purple-text',
      yellow: 'yellow-text',
      gray: 'gray-text',
    };
    return map[severity] || 'gray-text';
  }

  getRankClass(rank: number): string {
    const map: Record<number, string> = {
      1: 'gold',
      2: 'silver',
      3: 'bronze',
    };
    return map[rank] || '';
  }

  // Map stat card click -> popup rows (table)
  onStatCardClick(card: StatCard, index: number): void {
    this.isStatPopupOpen = true;
    this.statPopupTitle = card.label;

    switch (index) {
      case 0: // Total Assets
        this.statPopupRows = this.assetStatusDonut.legend.map((x) => ({
          Status: x.label,
          Value: x.value,
          Percentage: x.percentage,
        }));
        return;
      case 1: // Online / Moving
        this.statPopupRows = this.assetsByTypeDonut.legend.map((x) => ({
          Type: x.label,
          Value: x.value,
          Percentage: x.percentage,
        }));
        return;
      case 2: // Idle Assets
        this.statPopupRows = this.geofenceSummary.map((x) => ({
          Zone: x.name,
          AssetsInside: x.assetsInside,
          Alerts: x.alerts,
        }));
        return;
      case 3: // Offline
        this.statPopupRows = this.recentAlerts.map((a) => ({
          AlertType: a.type,
          Asset: a.asset,
          Time: a.time,
          Severity: a.severity,
        }));
        return;
      case 4: // Alerts
      default:
        this.statPopupRows = this.recentActivity.map((a) => ({
          AssetId: a.assetId,
          AssetName: a.assetName,
          Status: a.status,
          Location: a.location,
          Speed: a.speed,
          LastUpdate: a.lastUpdate,
          Live: a.live ? 'Yes' : 'No',
        }));
        return;
    }
  }

  closeStatPopup(): void {
    this.isStatPopupOpen = false;
    this.statPopupTitle = '';
    this.statPopupRows = [];
  }

  getPopupTableKeys(): string[] {
    const first = this.statPopupRows[0];
    if (!first) return [];
    return Object.keys(first);
  }
}
