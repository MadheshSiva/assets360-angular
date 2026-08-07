export interface InspectionNotificationTemplateItem {
  templateCode: string;
  templateName: string;
  event: string;
  channel: string;
  subject: string;
  messageBody: string;
  recipients: string;
  ccRecipients: string;
  escalationRecipients: string;
  activeStatus: boolean;
}
