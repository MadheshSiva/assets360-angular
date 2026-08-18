import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MapComponent, MapPin } from '../../../shared/map/map';
import { WidgetDragHandle } from '../../../shared/widget-drag-handle/widget-drag-handle';
import { loadOrder, saveOrder, reorderByKey } from '../../../shared/dashboard-widgets/widget-order.util';

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
  imports: [CommonModule, DragDropModule, MapComponent, WidgetDragHandle],
  templateUrl: './main-dashboard.html',
  styleUrls: ['./main-dashboard.css'],
})
export class MainDashboard implements OnInit {
  statCards: StatCard[] = [];

  // ===== Widget drag-and-drop ordering =====
  readonly row2Order: string[] = loadOrder('piq.dashboard.main.row2Order', ['donutStatus', 'donutType']);
  readonly alertsRowOrder: string[] = loadOrder('piq.dashboard.main.alertsRowOrder', ['alerts', 'topActive']);
  readonly row3Order: string[] = loadOrder('piq.dashboard.main.row3Order', ['utilization', 'geofence']);
  readonly row4Order: string[] = loadOrder('piq.dashboard.main.row4Order', ['activityTable', 'topDistance']);

  trackByWidgetId = (_: number, id: string) => id;

  private persistDrop(event: CdkDragDrop<string[]>, order: string[], storageKey: string): void {
    moveItemInArray(order, event.previousIndex, event.currentIndex);
    saveOrder(storageKey, order);
  }

  onStatCardDrop(event: CdkDragDrop<StatCard[]>): void {
    moveItemInArray(this.statCards, event.previousIndex, event.currentIndex);
    saveOrder('piq.dashboard.main.statOrder', this.statCards.map((c) => c.label));
  }

  onRow2Drop(event: CdkDragDrop<string[]>): void {
    this.persistDrop(event, this.row2Order, 'piq.dashboard.main.row2Order');
  }

  onAlertsRowDrop(event: CdkDragDrop<string[]>): void {
    this.persistDrop(event, this.alertsRowOrder, 'piq.dashboard.main.alertsRowOrder');
  }

  onRow3Drop(event: CdkDragDrop<string[]>): void {
    this.persistDrop(event, this.row3Order, 'piq.dashboard.main.row3Order');
  }

  onRow4Drop(event: CdkDragDrop<string[]>): void {
    this.persistDrop(event, this.row4Order, 'piq.dashboard.main.row4Order');
  }
  mapPins: MapPin[] = [
    { lat: 40.7168, lng: -74.001, color: '#22c55e', label: 'Forklift FL-07' },
    { lat: 40.7118, lng: -74.012, color: '#2563eb', label: 'Generator GEN-12' },
    { lat: 40.7098, lng: -73.998, color: '#f97316', label: 'HVAC System' },
    { lat: 40.7138, lng: -74.008, color: '#7c3aed', label: 'Compressor AC-04' },
    { lat: 40.7078, lng: -74.005, color: '#ef4444', label: 'Server SRV-09' },
  ];
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
    this.statCards = reorderByKey(data?.statCards ?? [], 'piq.dashboard.main.statOrder', (c) => c.label);
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

  getStatIconClass(index: number): string {
    const classes = ['icon-purple', 'icon-green', 'icon-orange', 'icon-red', 'icon-blue'];
    return classes[index] || 'icon-blue';
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
