import { Injectable } from '@angular/core';
import { InspectionTaskItem } from './inspection-task.model';

@Injectable({ providedIn: 'root' })
export class InspectionTaskService {
  readonly taskCategoryMaster: string[] = [
    'Visual Inspection',
    'Safety',
    'Functional Test',
    'Measurement',
    'Documentation',
    'Compliance',
    'Cleaning',
    'Calibration',
    'Mechanical',
    'Electrical'
  ];

  readonly responseTypeMaster: string[] = [
    'Pass/Fail',
    'Yes/No',
    'Multiple Choice',
    'Single Choice',
    'Text',
    'Number',
    'Date',
    'Rating',
    'Photo',
    'Signature'
  ];

  private readonly records: InspectionTaskItem[] = [
    {
      taskCode: 'ITASK-1001',
      assetId: 'AST-1001',
      assetName: 'HVAC Unit 1',
      taskTitle: 'Check for visible corrosion or leaks',
      taskCategory: 'Visual Inspection',
      taskDescription: 'Inspect housing, joints and seals for corrosion, rust or fluid leaks',
      responseType: 'Pass/Fail',
      isCritical: true,
      isMandatory: true,
      status: true
    },
    {
      taskCode: 'ITASK-1002',
      assetId: 'AST-1002',
      assetName: 'Fire Panel A',
      taskTitle: 'Verify fire extinguisher pressure gauge',
      taskCategory: 'Safety',
      taskDescription: 'Confirm gauge needle is in the green operating zone',
      responseType: 'Pass/Fail',
      isCritical: true,
      isMandatory: true,
      status: true
    },
    {
      taskCode: 'ITASK-1003',
      assetId: 'AST-1003',
      assetName: 'Chiller Pump 2',
      taskTitle: 'Record operating temperature',
      taskCategory: 'Measurement',
      taskDescription: 'Capture live temperature reading from the panel display',
      responseType: 'Number',
      isCritical: false,
      isMandatory: true,
      status: true
    },
    {
      taskCode: 'ITASK-1004',
      assetId: 'AST-1001',
      assetName: 'HVAC Unit 1',
      taskTitle: 'Capture asset nameplate photo',
      taskCategory: 'Documentation',
      taskDescription: "Take a clear photo of the asset's nameplate/serial tag",
      responseType: 'Photo',
      isCritical: false,
      isMandatory: false,
      status: false
    }
  ];

  private nextSequence = 1005;

  getRecords(): InspectionTaskItem[] {
    return this.records;
  }

  addRecord(record: InspectionTaskItem): InspectionTaskItem {
    const taskCode = record.taskCode?.trim() || `ITASK-${this.nextSequence++}`;
    const created: InspectionTaskItem = { ...record, taskCode };
    this.records.push(created);
    return created;
  }

  updateRecord(taskCode: string, changes: InspectionTaskItem): void {
    const index = this.records.findIndex((r) => r.taskCode === taskCode);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(taskCodes: string[]): void {
    for (const id of taskCodes) {
      const index = this.records.findIndex((r) => r.taskCode === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): InspectionTaskItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
