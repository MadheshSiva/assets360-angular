import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PredictiveMaintenanceRecord } from './predictive-maintenance.model';

/**
 * Standalone data/master layer for the Predictive Maintenance sub-module, kept independent
 * of the other Maintenance sub-modules so it can be pointed at its own backend microservice
 * (e.g. a sensor/analytics service) without touching the rest of the Maintenance feature set.
 */
@Injectable({ providedIn: 'root' })
export class PredictiveMaintenanceService {
  readonly sensorTypeMaster: string[] = ['Temperature', 'Vibration', 'Pressure', 'Humidity', 'Current'];
  readonly alertConditionMaster: string[] = [
    'Above Threshold',
    'Below Threshold',
    'Rate of Change',
    'Anomaly Detected'
  ];
  readonly deviceMaster: string[] = ['DEV-1001', 'DEV-1002', 'DEV-1003'];
  readonly riskLevelMaster: string[] = ['Low', 'Medium', 'High', 'Critical'];

  private readonly recordsSubject = new BehaviorSubject<PredictiveMaintenanceRecord[]>([
    {
      sensorType: 'Vibration',
      thresholdValue: 4.5,
      alertCondition: 'Above Threshold',
      dataSource: 'DEV-1001',
      predictionModelOutput: 'Bearing wear likely within 14 days',
      riskLevel: 'High'
    },
    {
      sensorType: 'Temperature',
      thresholdValue: 85,
      alertCondition: 'Above Threshold',
      dataSource: 'DEV-1002',
      predictionModelOutput: 'Motor overheating risk trending up',
      riskLevel: 'Medium'
    }
  ]);

  getRecords(): PredictiveMaintenanceRecord[] {
    return this.recordsSubject.value;
  }

  addRecord(record: PredictiveMaintenanceRecord): void {
    this.recordsSubject.next([...this.recordsSubject.value, record]);
  }

  updateRecord(original: PredictiveMaintenanceRecord, changes: PredictiveMaintenanceRecord): void {
    this.recordsSubject.next(
      this.recordsSubject.value.map((r) => (r === original ? { ...r, ...changes } : r))
    );
  }

  deleteRecords(items: PredictiveMaintenanceRecord[]): void {
    this.recordsSubject.next(this.recordsSubject.value.filter((r) => !items.includes(r)));
  }

  search(term: string): PredictiveMaintenanceRecord[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.recordsSubject.value;
    return this.recordsSubject.value.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
