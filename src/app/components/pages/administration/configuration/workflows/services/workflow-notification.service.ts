import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WorkflowNotification, NotificationLevel } from '../models/workflow.model';

// 2.7 Notifications & Escalations — feeds the topbar bell (see Topbar) and gives
// each workflow action (assigned / approved / rejected / escalated) a visible trail.
@Injectable({ providedIn: 'root' })
export class WorkflowNotificationService {
  private nextId = 6;

  private notificationsSubject = new BehaviorSubject<WorkflowNotification[]>([
    { id: 'ntf-1', message: 'Asset Transfer Request TR-204 pending your approval', timestamp: '2026-08-03 09:12', read: false, level: 'warning', link: '/administration/configuration/workflows/tasks' },
    { id: 'ntf-2', message: 'Disposal Request DR-118 approved by Finance', timestamp: '2026-08-02 16:40', read: false, level: 'success', link: '/administration/configuration/workflows/instances' },
    { id: 'ntf-3', message: 'Maintenance Approval workflow saved as Draft', timestamp: '2026-08-01 11:05', read: false, level: 'info', link: '/administration/configuration/workflows/list' },
    { id: 'ntf-4', message: 'SLA breached on Manager Approval step for AST-2041 creation', timestamp: '2026-07-31 08:22', read: true, level: 'error', link: '/administration/configuration/workflows/tasks' },
    { id: 'ntf-5', message: 'Asset Creation Approval AST-2041 escalated to Department Head', timestamp: '2026-07-30 17:50', read: true, level: 'warning', link: '/administration/configuration/workflows/tasks' }
  ]);

  watch() {
    return this.notificationsSubject.asObservable();
  }

  getAll(): WorkflowNotification[] {
    return this.notificationsSubject.value;
  }

  unreadCount(): number {
    return this.notificationsSubject.value.filter((n) => !n.read).length;
  }

  push(message: string, level: NotificationLevel, link: string): void {
    const notification: WorkflowNotification = {
      id: `ntf-${this.nextId++}`,
      message,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      read: false,
      level,
      link
    };
    this.notificationsSubject.next([notification, ...this.notificationsSubject.value]);
  }

  markAllRead(): void {
    this.notificationsSubject.next(this.notificationsSubject.value.map((n) => ({ ...n, read: true })));
  }

  markRead(id: string): void {
    this.notificationsSubject.next(
      this.notificationsSubject.value.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }
}
