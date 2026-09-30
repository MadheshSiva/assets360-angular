/**
 * Every widget the user can add to the dashboard, grouped by module.
 * Ids are local to their category; stat cards use `stat:<label>` (or `stat:<key>` for Inspection).
 * A full selection id is `<category>.<local id>`, e.g. `asset.stat:Total Assets`.
 */
export type WidgetCategoryKey = 'asset' | 'workOrder' | 'wip' | 'inspection';

export interface WidgetDef {
  id: string;
  label: string;
}

export interface WidgetCategory {
  key: WidgetCategoryKey;
  label: string;
  widgets: WidgetDef[];
}

const stat = (label: string, key = label): WidgetDef => ({ id: `stat:${key}`, label });

export const WIDGET_CATALOG: WidgetCategory[] = [
  {
    key: 'asset',
    label: 'Asset',
    widgets: [
      stat('Total Assets'),
      stat('Online / Moving'),
      stat('Idle Assets'),
      stat('Offline'),
      stat('Alerts'),
      { id: 'donutStatus', label: 'Asset Status' },
      { id: 'donutType', label: 'Assets by Type' },
      { id: 'alerts', label: 'Recent Alerts' },
      { id: 'topActive', label: 'Top Active Assets' },
      { id: 'utilization', label: 'Utilization' },
      { id: 'geofence', label: 'Geofence Summary' },
      { id: 'activityTable', label: 'Recent Activity' },
      { id: 'topDistance', label: 'Top Assets by Distance' },
    ],
  },
  {
    key: 'workOrder',
    label: 'Work Order',
    widgets: [
      stat('Total Work Orders'),
      stat('Completed'),
      stat('In Progress'),
      stat('Overdue'),
      stat('PM Due This Week'),
      stat('Maintenance Cost'),
      { id: 'timeline', label: 'Work Orders Over Time' },
      { id: 'compliance', label: 'PM Compliance' },
      { id: 'workStatus', label: 'Work Order Status' },
      { id: 'recent', label: 'Recent Work Orders' },
      { id: 'topAssets', label: 'Top Assets by Work Orders' },
      { id: 'costSummary', label: 'Maintenance Cost Summary' },
      { id: 'quickActions', label: 'Quick Actions' },
      { id: 'alerts', label: 'Alerts & Notifications' },
      { id: 'workload', label: 'Technician Workload' },
      { id: 'maintenance', label: 'Upcoming Maintenance' },
    ],
  },
  {
    key: 'wip',
    label: 'WIP',
    widgets: [
      stat('Total Jobs'),
      stat('In Progress'),
      stat('Completed today'),
      stat('SLA Breached'),
      stat('Planned'),
      { id: 'donut', label: 'Job Status Distribution' },
      { id: 'trend', label: 'Completion Trend' },
      { id: 'alerts', label: 'Alerts' },
      { id: 'jobs', label: 'Active Jobs' },
    ],
  },
  {
    key: 'inspection',
    label: 'Inspection',
    widgets: [
      stat('Total Work Orders', 'all'),
      stat('In Progress', 'inprogress'),
      stat('Pending Approval', 'pendingapproval'),
      stat('Completed', 'completed'),
      stat('Overdue', 'overdue'),
      { id: 'workOrders', label: 'Work Orders' },
      { id: 'myInspections', label: 'My Inspections' },
      { id: 'recent', label: 'Recent Inspections' },
      { id: 'summary', label: 'Inspection Summary' },
      { id: 'approval', label: 'Approval Summary' },
      { id: 'quickActions', label: 'Quick Actions' },
    ],
  },
];
