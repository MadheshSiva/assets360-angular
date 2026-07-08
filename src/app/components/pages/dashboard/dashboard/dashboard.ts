import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainDashboard } from '../main-dashboard/main-dashboard';
import { WipDashboard } from '../wip-dashboard/wip-dashboard';
import { MapComponent, MapPin } from '../../../shared/map/map';

interface AssetsStatCard {
  label: string;
  value: string;
  icon: string;
  iconBg: string;
  change: string;
  changeType: 'up' | 'down' | 'neutral';
  link?: string;
}

interface WorkStatusItem { label: string; value: string; color: string; }
interface Point { x: number; y: number; }
interface MaintenanceItem { id: string; asset: string; type: string; due: string; priority: string; priorityClass: string; }
interface WorkOrder { id: string; title: string; asset: string; status: string; statusClass: string; }
interface AssetBar { name: string; count: number; percent: number; }
interface CostItem { label: string; value: string; trend: string; trendType: 'up' | 'down'; }
interface AlertItem { title: string; detail: string; type: string; }
interface Technician { name: string; load: number; }

interface PopupColumn {
  key: string;
  label: string;
}

interface PopupRow {
  [key: string]: string | number | undefined;
}

interface CardPopup {
  title: string;
  summary: string;
  icon?: string;
  iconBg?: string;
  columns: PopupColumn[];
  rows: PopupRow[];
}

export type ActiveTab = 'dashboard' | 'assets' | 'wip';

type DateCell = {
  date: Date;
  iso: string;
  day: number;
  inCurrentMonth: boolean;
  isToday: boolean;
};

interface AssetsData {
  statCards: AssetsStatCard[];
  workStatus: WorkStatusItem[];
  chartGrid: number[];
  weekLabels: string[];
  createdPoints: Point[];
  completedPoints: Point[];
  overduePoints: Point[];
  upcomingMaintenance: MaintenanceItem[];
  recentWorkOrders: WorkOrder[];
  topAssets: AssetBar[];
  costSummary: CostItem[];
  quickActions: string[];
  alerts: AlertItem[];
  technicians: Technician[];
}

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, MainDashboard, WipDashboard, MapComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnInit {
  // ===== Tabs =====
  activeTab: ActiveTab = 'dashboard';
  cardPopup: CardPopup | null = null;
  mapPins: MapPin[] = [
    { lat: 40.7168, lng: -74.001, color: '#2563eb', label: 'WO-2456 · Air Compressor AC-04' },
    { lat: 40.7118, lng: -74.012, color: '#f97316', label: 'WO-2455 · HVAC System' },
    { lat: 40.7098, lng: -73.998, color: '#22c55e', label: 'WO-2454 · Generator GEN-12' },
    { lat: 40.7138, lng: -74.008, color: '#ef4444', label: 'WO-2452 · Forklift FL-07' },
  ];

  switchTab(tab: ActiveTab): void {
    this.activeTab = tab;
  }
  // ===== Tab Management =====
  editTab(tab: ActiveTab): void {
    // TODO: hook up your rename/edit logic here
    console.log('Edit tab:', tab);
  }

  deleteTab(tab: ActiveTab): void {
    // TODO: hook up your delete logic here
    console.log('Delete tab:', tab);
  }

  addNewTab(): void {
    // TODO: hook up your add-new-tab logic here
    console.log('Add new tab');
  }
  openCardPopup(card: AssetsStatCard): void {
    this.closePicker();
    this.cardPopup = this.buildCardPopup(card);
  }

  closeCardPopup(): void {
    this.cardPopup = null;
  }

  private buildCardPopup(card: AssetsStatCard): CardPopup | null {
    switch (card.label) {
      case 'Total Work Orders':
        return {
          title: card.label,
          summary: `${card.value} total work orders · ${card.change}`,
          icon: card.icon,
          iconBg: card.iconBg,
          columns: [
            { key: 'label', label: 'Status' },
            { key: 'value', label: 'Count' },
            { key: 'percent', label: 'Percent' },
          ],
          rows: this.getWorkStatusRows(),
        };

      case 'Completed':
        return {
          title: 'Completed Work Orders',
          summary: `${card.value} completed work orders · ${card.change}`,
          icon: card.icon,
          iconBg: card.iconBg,
          columns: [
            { key: 'id', label: 'Work Order ID' },
            { key: 'title', label: 'Title' },
            { key: 'asset', label: 'Asset' },
            { key: 'status', label: 'Status' },
          ],
          rows: this.getRecentWorkOrderRows('Completed'),
        };

      case 'In Progress':
        return {
          title: 'In Progress Work Orders',
          summary: `${card.value} in progress work orders · ${card.change}`,
          icon: card.icon,
          iconBg: card.iconBg,
          columns: [
            { key: 'id', label: 'Work Order ID' },
            { key: 'title', label: 'Title' },
            { key: 'asset', label: 'Asset' },
            { key: 'status', label: 'Status' },
          ],
          rows: this.getRecentWorkOrderRows('In Progress'),
        };

      case 'Overdue':
        return {
          title: 'Overdue Work Orders',
          summary: `${card.value} overdue work orders · ${card.change}`,
          icon: card.icon,
          iconBg: card.iconBg,
          columns: [
            { key: 'id', label: 'Work Order ID' },
            { key: 'asset', label: 'Asset' },
            { key: 'type', label: 'Type' },
            { key: 'due', label: 'Due Date' },
            { key: 'priority', label: 'Priority' },
            { key: 'status', label: 'Status' },
          ],
          rows: this.getMaintenanceRows(),
        };

      case 'PM Due This Week':
        return {
          title: card.label,
          summary: `${card.value} preventive maintenance items due this week`,
          icon: card.icon,
          iconBg: card.iconBg,
          columns: [
            { key: 'id', label: 'Work Order ID' },
            { key: 'asset', label: 'Asset' },
            { key: 'type', label: 'Type' },
            { key: 'due', label: 'Due Date' },
            { key: 'priority', label: 'Priority' },
            { key: 'status', label: 'Status' },
          ],
          rows: this.getMaintenanceRows(),
        };

      case 'Maintenance Cost':
        return {
          title: card.label,
          summary: `${card.value} maintenance cost · ${card.change}`,
          icon: card.icon,
          iconBg: card.iconBg,
          columns: [
            { key: 'label', label: 'Period' },
            { key: 'value', label: 'Cost' },
            { key: 'trend', label: 'Trend' },
          ],
          rows: this.getCostRows(),
        };

      default:
        return null;
    }
  }

  private getWorkStatusRows(): PopupRow[] {
    return this.workStatus.map((item) => ({
      label: item.label,
      value: item.value,
      percent: this.extractPercent(item.value),
    }));
  }

  private getRecentWorkOrderRows(status: string): PopupRow[] {
    const rows = this.recentWorkOrders
      .filter((order) => order.status === status)
      .map((order) => ({
        id: order.id,
        title: order.title,
        asset: order.asset,
        status: order.status,
      }));

    return rows.length
      ? rows
      : [
          {
            id: 'No records',
            title: 'No matching work orders found',
            asset: '-',
            status: '-',
          },
        ];
  }

  private getMaintenanceRows(): PopupRow[] {
    return this.upcomingMaintenance.map((item) => ({
      id: item.id,
      asset: item.asset,
      type: item.type,
      due: item.due,
      priority: item.priority,
      status: 'Pending',
    }));
  }

  private getCostRows(): PopupRow[] {
    return this.costSummary.map((item) => ({
      label: item.label,
      value: item.value,
      trend: item.trend,
    }));
  }

  private extractPercent(value: string): string {
    const match = value.match(/\(([^)]+)\)/);
    return match ? match[1] : '-';
  }

  // ===== Date Range Picker State =====
  isPickerOpen = false;
  startDate: Date | null = new Date(2024, 4, 22); // May 22, 2024
  endDate: Date | null = new Date(2024, 4, 28); // May 28, 2024;
  // The month that the LEFT calendar is showing
  viewMonth: Date = new Date(2024, 4, 1);
  // The selection stage: 'start' or 'end'
  selecting: 'start' | 'end' = 'start';
  // Hover preview of the end date
  hoverDate: Date | null = null;

  readonly weekdayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  readonly monthLabels = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  presets: { label: string; getRange: () => { start: Date; end: Date } }[] = [
    {
      label: 'Today',
      getRange: () => {
        const t = new Date();
        return { start: t, end: t };
      },
    },
    {
      label: 'Yesterday',
      getRange: () => {
        const y = new Date();
        y.setDate(y.getDate() - 1);
        return { start: y, end: y };
      },
    },
    {
      label: 'Last 7 Days',
      getRange: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 6);
        return { start, end };
      },
    },
    {
      label: 'Last 30 Days',
      getRange: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 29);
        return { start, end };
      },
    },
    {
      label: 'This Month',
      getRange: () => {
        const now = new Date();
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        };
      },
    },
    {
      label: 'Last Month',
      getRange: () => {
        const now = new Date();
        return {
          start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          end: new Date(now.getFullYear(), now.getMonth(), 0),
        };
      },
    },
  ];

  // ===== Data Properties =====
  statCards: AssetsStatCard[] = [];
  workStatus: WorkStatusItem[] = [];
  chartGrid: number[] = [];
  weekLabels: string[] = [];
  createdPoints: Point[] = [];
  completedPoints: Point[] = [];
  overduePoints: Point[] = [];
  upcomingMaintenance: MaintenanceItem[] = [];
  recentWorkOrders: WorkOrder[] = [];
  topAssets: AssetBar[] = [];
  costSummary: CostItem[] = [];
  quickActions: string[] = [];
  alerts: AlertItem[] = [];
  technicians: Technician[] = [];

  constructor(private host: ElementRef<HTMLElement>) {}

  async ngOnInit(): Promise<void> {
    const response = await fetch('/assets/data/assets-data.json');
    const data: AssetsData = await response.json();
    this.statCards = data.statCards;
    this.workStatus = data.workStatus;
    this.chartGrid = data.chartGrid;
    this.weekLabels = data.weekLabels;
    this.createdPoints = data.createdPoints;
    this.completedPoints = data.completedPoints;
    this.overduePoints = data.overduePoints;
    this.upcomingMaintenance = data.upcomingMaintenance;
    this.recentWorkOrders = data.recentWorkOrders;
    this.topAssets = data.topAssets;
    this.costSummary = data.costSummary;
    this.quickActions = data.quickActions;
    this.alerts = data.alerts;
    this.technicians = data.technicians;
  }

  // ===== Picker Open/Close =====
  togglePicker(): void {
    this.isPickerOpen = !this.isPickerOpen;
    if (this.isPickerOpen) {
      // Initialize the visible month to the month of the current start date
      this.viewMonth = new Date(
        (this.startDate ?? new Date()).getFullYear(),
        (this.startDate ?? new Date()).getMonth(),
        1
      );
      this.selecting = 'start';
      this.hoverDate = null;
    }
  }

  closePicker(): void {
    this.isPickerOpen = false;
  }

  // Close when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isPickerOpen) return;
    const target = event.target as Node;
    if (!this.host.nativeElement.contains(target)) {
      this.isPickerOpen = false;
    }
  }

  // Close on Escape
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isPickerOpen) this.isPickerOpen = false;
    if (this.cardPopup) this.closeCardPopup();
  }

  // ===== Calendar Generation =====
  get leftMonthCells(): DateCell[] {
    return this.buildMonthGrid(this.viewMonth);
  }

  get rightMonthCells(): DateCell[] {
    const next = new Date(this.viewMonth.getFullYear(), this.viewMonth.getMonth() + 1, 1);
    return this.buildMonthGrid(next);
  }

  get leftMonthLabel(): string {
    return `${this.monthLabels[this.viewMonth.getMonth()]} ${this.viewMonth.getFullYear()}`;
  }

  get rightMonthLabel(): string {
    const next = new Date(this.viewMonth.getFullYear(), this.viewMonth.getMonth() + 1, 1);
    return `${this.monthLabels[next.getMonth()]} ${next.getFullYear()}`;
  }

  private buildMonthGrid(monthAnchor: Date): DateCell[] {
    const year = monthAnchor.getFullYear();
    const month = monthAnchor.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = firstOfMonth.getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells: DateCell[] = [];

    // Leading days from previous month
    for (let i = startWeekday - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthDays - i);
      cells.push(this.makeCell(d, false));
    }
    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      cells.push(this.makeCell(d, true));
    }
    // Trailing days from next month to fill 6 rows (42 cells)
    while (cells.length < 42) {
      const d = new Date(year, month + 1, cells.length - (startWeekday + daysInMonth) + 1);
      cells.push(this.makeCell(d, false));
    }
    return cells;
  }

  private makeCell(date: Date, inCurrentMonth: boolean): DateCell {
    const today = new Date();
    const isToday =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();

    return {
      date,
      iso: this.toIso(date),
      day: date.getDate(),
      inCurrentMonth,
      isToday,
    };
  }

  // ===== Navigation between months =====
  prevMonth(): void {
    this.viewMonth = new Date(this.viewMonth.getFullYear(), this.viewMonth.getMonth() - 1, 1);
  }

  nextMonth(): void {
    this.viewMonth = new Date(this.viewMonth.getFullYear(), this.viewMonth.getMonth() + 1, 1);
  }

  // ===== Cell State Checks =====
  isInRange(cell: DateCell): boolean {
    if (!this.startDate) return false;
    const end = this.endDate ?? this.hoverDate;
    if (!end) return false;
    const t = cell.date.getTime();
    const s = this.startDate.getTime();
    const e = end.getTime();
    const lo = Math.min(s, e);
    const hi = Math.max(s, e);
    return t > lo && t < hi;
  }

  isStart(cell: DateCell): boolean {
    if (!this.startDate) return false;
    return this.sameDay(cell.date, this.startDate);
  }

  isEnd(cell: DateCell): boolean {
    if (!this.endDate) return false;
    return this.sameDay(cell.date, this.endDate);
  }

  isPreviewEnd(cell: DateCell): boolean {
    if (this.endDate) return false;
    if (this.selecting !== 'end' || !this.hoverDate) return false;
    if (!this.startDate) return false;
    // Only preview when the hover date would become the end
    if (this.hoverDate.getTime() < this.startDate.getTime()) return false;
    return this.sameDay(cell.date, this.hoverDate);
  }

  // ===== Selecting a Day =====
  onPickDay(cell: DateCell): void {
    if (this.selecting === 'start' || (this.startDate && this.endDate)) {
      this.startDate = new Date(cell.date);
      this.endDate = null;
      this.selecting = 'end';
    } else if (this.selecting === 'end' && this.startDate) {
      if (cell.date.getTime() < this.startDate.getTime()) {
        // If user picks earlier date as end, swap so range is valid
        this.endDate = this.startDate;
        this.startDate = new Date(cell.date);
      } else {
        this.endDate = new Date(cell.date);
      }
      this.selecting = 'start';
    }
    this.hoverDate = null;
    // Snap the visible month so the selected start is visible
    this.viewMonth = new Date(
      (this.startDate ?? cell.date).getFullYear(),
      (this.startDate ?? cell.date).getMonth(),
      1
    );
  }

  onHoverDay(cell: DateCell): void {
    if (this.selecting === 'end' && this.startDate && !this.endDate) {
      this.hoverDate = new Date(cell.date);
    }
  }

  clearHover(): void {
    if (this.selecting === 'end' && !this.endDate) {
      this.hoverDate = null;
    }
  }

  // ===== Preset =====
  applyPreset(preset: { label: string; getRange: () => { start: Date; end: Date } }): void {
    const { start, end } = preset.getRange();
    this.startDate = start;
    this.endDate = end;
    this.viewMonth = new Date(start.getFullYear(), start.getMonth(), 1);
    this.selecting = 'start';
  }

  applySelection(): void {
    if (this.startDate && !this.endDate) {
      // Single day when only start is picked
      this.endDate = new Date(this.startDate);
    }
    this.isPickerOpen = false;
  }

  resetPicker(): void {
    this.startDate = null;
    this.endDate = null;
    this.hoverDate = null;
    this.selecting = 'start';
  }

  // ===== Display =====
  get displayRange(): string {
    if (!this.startDate) return 'Select date range';
    if (!this.endDate || this.sameDay(this.startDate, this.endDate)) {
      return this.formatDate(this.startDate);
    }
    return `${this.formatDate(this.startDate)} - ${this.formatDate(this.endDate)}, ${this.endDate.getFullYear()}`;
  }

  // ===== Helpers =====
  private formatDate(d: Date): string {
    return `${this.monthLabels[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
  }

  private sameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  private toIso(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  trackByIso = (_: number, cell: DateCell) => cell.iso;
}
