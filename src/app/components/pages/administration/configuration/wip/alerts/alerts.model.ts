export type AlertType = 'Delay' | 'SLA Breach' | 'Safety' | 'Completion';
export type AlertNotificationChannel = 'Email' | 'SMS' | 'App';

export interface Alert {
  alertId: string;
  alertType: AlertType | '';
  triggerCondition: string;
  notificationChannel: AlertNotificationChannel[];
  recipientRole: string;
  escalationLevel: number | null;
  selected?: boolean;
}

export type AlertForm = Omit<Alert, 'selected'>;
