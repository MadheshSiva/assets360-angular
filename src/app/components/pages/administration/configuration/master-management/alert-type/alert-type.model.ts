export type AlertCategory = 'Geofence' | 'Battery' | 'Device Health' | 'Security' | 'Maintenance';
export type AlertSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type AlertNotificationType = 'Email' | 'SMS' | 'Push Notification' | 'In-App';
export type AlertStatus = 'Active' | 'Inactive';

export interface MasterManagementAlertTypeItem {
  alertTypeId: string;
  alertName: string;
  alertCode: string;
  description: string;
  category: AlertCategory | '';
  severity: AlertSeverity | '';
  triggerCondition: string;
  notificationType: AlertNotificationType | '';
  status: AlertStatus | '';
}
