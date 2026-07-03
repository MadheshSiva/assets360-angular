import { Component, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProcessAutomationService } from '../services/process-automation.service';

export type LogicOperator = 'AND' | 'OR';

export type ConditionType =
  | ''
  | 'When the device is'
  | 'When the time is'
  | 'When the people is'
  | 'When the zone is';

// which single dropdown (across all levels) is currently open on a row
export type ConditionField =
  | 'type'
  | 'device'
  | 'property'
  | 'compare'
  | 'people'
  | 'zone'
  | null;

export interface ConditionRow {
  id: number;
  operator: LogicOperator; // operator joining THIS row to the previous one (ignored for row 0)

  // ----- Level 1: what kind of condition -----
  type: ConditionType;

  // ----- "When the device is" cascade -----
  device: string;   // Level 2: Device 1 / Device 2 / Device 3
  property: string; // Level 3: Energy Saved / Energy Consumed / Status
  compareOp: string; // Level 4: Less than / Greater than / Equal to / Not equal to / Online / Offline

  // ----- "When the people is" (single level for now) -----
  people: string;

  // ----- "When the zone is" (single level for now) -----
  zone: string;

  // ----- "When the time is" cascade -----
  startHH: string;
  startMM: string;
  endHH: string;
  endMM: string;
  days: string[];

  // tracks which single dropdown is expanded on this row
  openField: ConditionField;
}

export type ActionType =
  | ''
  | 'Trigger device(s) to..'
  | 'Send an alarm notification';

// which single dropdown (across all levels) is currently open on an action row
export type ActionField =
  | 'type'
  | 'device'
  | 'deviceType'
  | 'status'
  | null;

export interface ActionRow {
  id: number;

  // ----- Level 1: what kind of action -----
  value: ActionType;

  // ----- "Trigger device(s) to.." cascade -----
  device: string;     // Level 2: Light Sensor / Gas Sensor / Controller
  deviceType: string; // Level 3: Testing for display name / Testing for indoor / Testing for outdoor
  status: string;     // Level 4: Online / Offline

  // ----- "Send an alarm notification" (multi-select toggle) -----
  notifyChannels: string[]; // Dashboard / Email / Alarm

  // tracks which single dropdown is expanded on this row
  openField: ActionField;
}

export interface AutomationListItem {
  id: number;
  name: string;
}

@Component({
  standalone: true,
  selector: 'app-process-automation-add',
  imports: [CommonModule, FormsModule],
  providers: [ProcessAutomationService],
  templateUrl: './process-automation-add.html',
  styleUrls: ['./process-automation-add.css']
})
export class ProcessAutomationAdd {
  // ----- Sidebar -----
  searchTerm = '';

  automations: AutomationListItem[] = [
    { id: 1, name: 'Track People' }
  ];

  selectedAutomationId: number | null = 1;

  get filteredAutomations(): AutomationListItem[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.automations;
    return this.automations.filter(a => a.name.toLowerCase().includes(term));
  }

  selectAutomation(item: AutomationListItem): void {
    this.selectedAutomationId = item.id;
  }

  // ----- Main form -----
  title = '';

  // Level 1 options (conditions)
  conditionTypeOptions: ConditionType[] = [
    'When the device is',
    'When the time is',
    'When the people is',
    'When the zone is'
  ];

  // Device cascade options (conditions)
  deviceOptions = ['Device 1', 'Device 2', 'Device 3'];
  propertyOptions = ['Energy Saved', 'Energy Consumed', 'Status'];
  compareOptionsNumeric = ['Less than', 'Greater than', 'Equal to', 'Not equal to'];
  compareOptionsStatus = ['Online', 'Offline'];

  // People / Zone options (placeholder single-level lists — extend if these need their own cascade)
  peopleOptions = ['Person 1', 'Person 2', 'Person 3'];
  zoneOptions = ['Zone 1', 'Zone 2', 'Zone 3'];

  // Time cascade options
  dayOptions = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Level 1 options (actions)
  actionOptions: ActionType[] = [
    'Trigger device(s) to..',
    'Send an alarm notification'
  ];

  // "Trigger device(s) to.." cascade options
  actionDeviceOptions = ['Light Sensor', 'Gas Sensor', 'Controller'];
  actionDeviceTypeOptions = ['Testing for display name', 'Testing for indoor', 'Testing for outdoor'];
  actionStatusOptions = ['Online', 'Offline'];

  // "Send an alarm notification" toggle options
  notifyChannelOptions = ['Dashboard', 'Email', 'Alarm'];

  private conditionRowId = 1;
  private actionRowId = 1;

  conditions: ConditionRow[] = [this.newConditionRow()];

  actions: ActionRow[] = [this.newActionRow()];

  setTimePeriod = false;

  submitted = false;

  constructor(
    private service: ProcessAutomationService,
    private router: Router,
    private elRef: ElementRef
  ) {}

  private newConditionRow(): ConditionRow {
    return {
      id: this.conditionRowId++,
      operator: 'AND',
      type: '',
      device: '',
      property: '',
      compareOp: '',
      people: '',
      zone: '',
      startHH: '',
      startMM: '',
      endHH: '',
      endMM: '',
      days: [],
      openField: null
    };
  }

  private newActionRow(): ActionRow {
    return {
      id: this.actionRowId++,
      value: '',
      device: '',
      deviceType: '',
      status: '',
      notifyChannels: [],
      openField: null
    };
  }

  // Close any open dropdown when clicking outside of it
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!this.elRef.nativeElement.contains(target)) {
      this.closeAllDropdowns();
      return;
    }
    if (!target.closest('.pa-dropdown-wrap')) {
      this.closeAllDropdowns();
    }
  }

  private closeAllDropdowns(): void {
    this.conditions.forEach(c => (c.openField = null));
    this.actions.forEach(a => (a.openField = null));
  }

  // ===== Relationship label, e.g. "A", "AANDB", "AANDBORC" =====
  get relationshipLabel(): string {
    return this.conditions
      .map((c, i) => {
        const letter = String.fromCharCode(65 + i);
        return i === 0 ? letter : c.operator + letter;
      })
      .join('');
  }

  // ===== Conditions =====
  conditionLabel(index: number): string {
    return 'Condition ' + String.fromCharCode(65 + index);
  }

  // Opens/closes a specific dropdown level on a given row; only one dropdown
  // (across all rows and all levels) is ever open at a time.
  toggleField(row: ConditionRow, field: ConditionField): void {
    const wasOpenOnThisField = row.openField === field;
    this.closeAllDropdowns();
    row.openField = wasOpenOnThisField ? null : field;
  }

  // ----- Level 1: condition type -----
  selectType(row: ConditionRow, type: ConditionType): void {
    row.type = type;
    // changing the top-level type resets every downstream field
    row.device = '';
    row.property = '';
    row.compareOp = '';
    row.people = '';
    row.zone = '';
    row.startHH = '';
    row.startMM = '';
    row.endHH = '';
    row.endMM = '';
    row.days = [];
    row.openField = null;
  }

  // ----- "When the device is" cascade -----
  selectDevice(row: ConditionRow, device: string): void {
    row.device = device;
    row.property = '';
    row.compareOp = '';
    row.openField = null;
  }

  selectProperty(row: ConditionRow, property: string): void {
    row.property = property;
    row.compareOp = '';
    row.openField = null;
  }

  selectCompare(row: ConditionRow, op: string): void {
    row.compareOp = op;
    row.openField = null;
  }

  // "Status" is a boolean-ish property (Online/Offline), everything else is numeric
  compareOptionsFor(row: ConditionRow): string[] {
    return row.property === 'Status' ? this.compareOptionsStatus : this.compareOptionsNumeric;
  }

  // ----- "When the people is" / "When the zone is" -----
  selectPeople(row: ConditionRow, value: string): void {
    row.people = value;
    row.openField = null;
  }

  selectZone(row: ConditionRow, value: string): void {
    row.zone = value;
    row.openField = null;
  }

  // ----- "When the time is" cascade -----
  toggleDay(row: ConditionRow, day: string): void {
    const idx = row.days.indexOf(day);
    if (idx > -1) {
      row.days.splice(idx, 1);
    } else {
      row.days.push(day);
    }
  }

  isDaySelected(row: ConditionRow, day: string): boolean {
    return row.days.includes(day);
  }

  effectiveTimeLabel(row: ConditionRow): string {
    const start = (row.startHH || '00') + ':' + (row.startMM || '00');
    const end = (row.endHH || '23') + ':' + (row.endMM || '59');
    return `Effective Time: ${start} - ${end}`;
  }

  addCondition(): void {
    this.conditions.push(this.newConditionRow());
  }

  removeCondition(id: number): void {
    if (this.conditions.length === 1) return;
    this.conditions = this.conditions.filter(c => c.id !== id);
  }

  // ===== Actions =====
  actionLabel(index: number): string {
    return 'Action ' + String.fromCharCode(65 + index);
  }

  // Opens/closes a specific dropdown level on a given action row; only one
  // dropdown (across all rows and all levels, conditions or actions) is ever
  // open at a time.
  toggleActionField(row: ActionRow, field: ActionField): void {
    const wasOpenOnThisField = row.openField === field;
    this.closeAllDropdowns();
    row.openField = wasOpenOnThisField ? null : field;
  }

  // ----- Level 1: action type -----
  selectActionType(row: ActionRow, type: ActionType): void {
    row.value = type;
    // changing the top-level type resets every downstream field
    row.device = '';
    row.deviceType = '';
    row.status = '';
    row.notifyChannels = [];
    row.openField = null;
  }

  // ----- "Trigger device(s) to.." cascade -----
  selectActionDevice(row: ActionRow, device: string): void {
    row.device = device;
    row.deviceType = '';
    row.status = '';
    row.openField = null;
  }

  selectActionDeviceType(row: ActionRow, type: string): void {
    row.deviceType = type;
    row.status = '';
    row.openField = null;
  }

  selectActionStatus(row: ActionRow, status: string): void {
    row.status = status;
    row.openField = null;
  }

  // ----- "Send an alarm notification" (multi-select toggle) -----
  toggleNotifyChannel(row: ActionRow, channel: string): void {
    const idx = row.notifyChannels.indexOf(channel);
    if (idx > -1) {
      row.notifyChannels.splice(idx, 1);
    } else {
      row.notifyChannels.push(channel);
    }
  }

  isNotifyChannelSelected(row: ActionRow, channel: string): boolean {
    return row.notifyChannels.includes(channel);
  }

  addAction(): void {
    this.actions.push(this.newActionRow());
  }

  removeAction(id: number): void {
    if (this.actions.length === 1) return;
    this.actions = this.actions.filter(a => a.id !== id);
  }

  // ===== Create / Cancel =====
  create(): void {
    this.submitted = true;
    if (!this.title.trim()) return;

    const payload = {
      title: this.title.trim(),
      relationship: this.relationshipLabel,
      conditions: this.conditions.map(c => ({
        operator: c.operator,
        type: c.type,
        device: c.device,
        property: c.property,
        compareOp: c.compareOp,
        people: c.people,
        zone: c.zone,
        time: c.type === 'When the time is'
          ? {
              start: (c.startHH || '00') + ':' + (c.startMM || '00'),
              end: (c.endHH || '23') + ':' + (c.endMM || '59'),
              days: c.days
            }
          : null
      })),
      setTimePeriod: this.setTimePeriod,
      actions: this.actions
        .filter(a => !!a.value)
        .map(a => ({
          type: a.value,
          device: a.device,
          deviceType: a.deviceType,
          status: a.status,
          notifyChannels: a.notifyChannels
        }))
    };

    const svc: any = this.service;
    if (typeof svc.addRule === 'function') {
      svc.addRule(payload);
    } else if (typeof svc.create === 'function') {
      svc.create(payload);
    }

    this.router.navigate(['/process-automation']);
  }

  cancel(): void {
    this.router.navigate(['/process-automation']);
  }
}