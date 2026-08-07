import { Injectable } from '@angular/core';
import { InspectionNotificationTemplateItem } from './notification-template.model';

@Injectable({ providedIn: 'root' })
export class InspectionNotificationTemplateService {
  readonly eventMaster: string[] = [
    'Work Order Created',
    'Work Order Assigned',
    'Work Order Accepted',
    'Work Order Due',
    'Work Order Overdue',
    'Inspection Submitted',
    'Approval Pending',
    'Work Order Approved',
    'Work Order Rejected',
    'Rework Requested',
    'Critical Failure Found',
    'Certificate Expiring',
    'Work Order Completed'
  ];

  readonly channelMaster: string[] = [
    'Email',
    'SMS',
    'Push Notification',
    'In-App Notification',
    'WhatsApp',
    'Microsoft Teams',
    'Webhook'
  ];

  private readonly records: InspectionNotificationTemplateItem[] = [
    {
      templateCode: 'NTPL-1001',
      templateName: 'Work Order Created Notification',
      event: 'Work Order Created',
      channel: 'Email',
      subject: 'New Work Order Created: {{workOrderId}}',
      messageBody: 'A new work order has been created and requires attention.',
      recipients: 'Assigned Technician',
      ccRecipients: 'Department Head',
      escalationRecipients: 'Facilities Manager',
      activeStatus: true
    },
    {
      templateCode: 'NTPL-1002',
      templateName: 'Overdue Work Order Alert',
      event: 'Work Order Overdue',
      channel: 'SMS',
      subject: 'Work Order Overdue',
      messageBody: 'Work order {{workOrderId}} is overdue. Immediate action required.',
      recipients: 'Assigned Technician, Supervisor',
      ccRecipients: '',
      escalationRecipients: 'Operations Manager',
      activeStatus: true
    },
    {
      templateCode: 'NTPL-1003',
      templateName: 'Approval Pending Reminder',
      event: 'Approval Pending',
      channel: 'Push Notification',
      subject: 'Approval Needed',
      messageBody: 'You have a pending approval waiting for your review.',
      recipients: 'Approver',
      ccRecipients: '',
      escalationRecipients: '',
      activeStatus: true
    },
    {
      templateCode: 'NTPL-1004',
      templateName: 'Critical Failure Alert',
      event: 'Critical Failure Found',
      channel: 'WhatsApp',
      subject: 'Critical Failure Detected',
      messageBody: 'A critical failure was reported during inspection. Escalating immediately.',
      recipients: 'Site Manager, Safety Officer',
      ccRecipients: 'Regional Manager',
      escalationRecipients: 'Director of Operations',
      activeStatus: true
    }
  ];

  private nextSequence = 1005;

  getRecords(): InspectionNotificationTemplateItem[] {
    return this.records;
  }

  addRecord(record: InspectionNotificationTemplateItem): InspectionNotificationTemplateItem {
    const templateCode = record.templateCode?.trim() || `NTPL-${this.nextSequence++}`;
    const created: InspectionNotificationTemplateItem = { ...record, templateCode };
    this.records.push(created);
    return created;
  }

  updateRecord(templateCode: string, changes: InspectionNotificationTemplateItem): void {
    const index = this.records.findIndex((r) => r.templateCode === templateCode);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(templateCodes: string[]): void {
    for (const id of templateCodes) {
      const index = this.records.findIndex((r) => r.templateCode === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): InspectionNotificationTemplateItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
