import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Alert, AlertType, AlertNotificationChannel } from './alerts.model';
import { RoleAccessService } from '../role-access/role-access.service';

@Injectable({ providedIn: 'root' })
export class AlertService {
  readonly alertTypeMaster: AlertType[] = ['Delay', 'SLA Breach', 'Safety', 'Completion'];
  readonly notificationChannelMaster: AlertNotificationChannel[] = ['Email', 'SMS', 'App'];

  constructor(private roleAccessService: RoleAccessService) {}

  get roleMaster() {
    return this.roleAccessService.getRecords();
  }

  private readonly recordsSubject = new BehaviorSubject<Alert[]>([
    {
      alertId: 'ALT-1001',
      alertType: 'SLA Breach',
      triggerCondition: 'Response time exceeds SLA threshold for Critical priority jobs',
      notificationChannel: ['Email', 'App'],
      recipientRole: 'ROL-1001',
      escalationLevel: 1
    },
    {
      alertId: 'ALT-1002',
      alertType: 'Delay',
      triggerCondition: 'Task planned end time passed without completion',
      notificationChannel: ['App'],
      recipientRole: 'ROL-1002',
      escalationLevel: 2
    }
  ]);

  private nextSequence = 1003;

  getRecords(): Alert[] {
    return this.recordsSubject.value;
  }

  addRecord(record: Alert): Alert {
    const alertId = record.alertId || `ALT-${this.nextSequence++}`;
    const created: Alert = { ...record, alertId };
    this.recordsSubject.next([...this.recordsSubject.value, created]);
    return created;
  }

  updateRecord(alertId: string, changes: Alert): void {
    this.recordsSubject.next(
      this.recordsSubject.value.map((r) => (r.alertId === alertId ? { ...r, ...changes } : r))
    );
  }

  deleteRecords(alertIds: string[]): void {
    this.recordsSubject.next(this.recordsSubject.value.filter((r) => !alertIds.includes(r.alertId)));
  }

  search(term: string): Alert[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.recordsSubject.value;
    return this.recordsSubject.value.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
