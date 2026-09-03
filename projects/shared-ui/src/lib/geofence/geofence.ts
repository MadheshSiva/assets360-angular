import { Injectable, signal } from '@angular/core';

export type GeofenceTrigger = 'enter' | 'exit';
export type GeofenceAction =
  | 'notify'
  | 'trigger_workflow'
  | 'turn_on_device'
  | 'email_sms'
  | 'api_callback'
  | 'camera_snapshot';

export const GEOFENCE_ACTION_LABELS: Record<GeofenceAction, string> = {
  notify: 'Send notification',
  trigger_workflow: 'Trigger workflow',
  turn_on_device: 'Turn on device',
  email_sms: 'Email / SMS',
  api_callback: 'API callback',
  camera_snapshot: 'Trigger camera snapshot',
};

export const GEOFENCE_ACTIONS: GeofenceAction[] = [
  'notify',
  'trigger_workflow',
  'turn_on_device',
  'email_sms',
  'api_callback',
  'camera_snapshot',
];

export interface GeofenceRule {
  id: string;
  zoneId: string;
  zoneName: string;
  trigger: GeofenceTrigger;
  action: GeofenceAction;
  enabled: boolean;
  createdAt: string;
}

export interface GeofenceEvent {
  id: string;
  ruleId: string;
  message: string;
  at: string;
}

/**
 * In-memory mock geofencing rule store. Rule CRUD is fully functional client-side;
 * `simulateFire` only logs that a rule *would* fire — real delivery (email/SMS/API
 * callback/workflow trigger/device control) needs a backend integration.
 */
@Injectable({ providedIn: 'root' })
export class GeofenceService {
  private readonly _rules = signal<GeofenceRule[]>([]);
  readonly rules = this._rules.asReadonly();

  private readonly _events = signal<GeofenceEvent[]>([]);
  readonly events = this._events.asReadonly();

  addRule(input: Omit<GeofenceRule, 'id' | 'createdAt' | 'enabled'>): GeofenceRule {
    const rule: GeofenceRule = {
      ...input,
      id: crypto.randomUUID(),
      enabled: true,
      createdAt: new Date().toISOString(),
    };
    this._rules.update((rules) => [...rules, rule]);
    return rule;
  }

  toggleRule(id: string): void {
    this._rules.update((rules) => rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  }

  deleteRule(id: string): void {
    this._rules.update((rules) => rules.filter((r) => r.id !== id));
  }

  /** Simulates a rule firing (no real backend delivery) so the UI reflects that it triggered. */
  simulateFire(rule: GeofenceRule): void {
    const event: GeofenceEvent = {
      id: crypto.randomUUID(),
      ruleId: rule.id,
      message: `${GEOFENCE_ACTION_LABELS[rule.action]} — ${rule.trigger === 'enter' ? 'entered' : 'exited'} ${rule.zoneName}`,
      at: new Date().toLocaleTimeString(),
    };
    this._events.update((events) => [event, ...events].slice(0, 20));
  }
}
