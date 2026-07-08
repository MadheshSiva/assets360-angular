import { Injectable } from '@angular/core';
import { AssetLinking } from './asset-linking.model';

@Injectable({ providedIn: 'root' })
export class AssetLinkingService {
  readonly assetTypeMaster: string[] = [
    'HVAC Equipment',
    'Fire Safety Equipment',
    'Mechanical Equipment',
    'Electrical Equipment',
    'IT Equipment'
  ];

  readonly currentStatusMaster: string[] = ['Active', 'Inactive', 'Under Repair', 'Decommissioned'];
  readonly utilizationStatusMaster: string[] = ['In Use', 'Idle', 'Reserved', 'Out of Service'];
  readonly conditionMaster: string[] = ['New', 'Good', 'Fair', 'Poor', 'Critical'];

  private readonly assets: AssetLinking[] = [
    {
      assetId: 'AST-1001',
      assetName: 'HVAC Unit 1',
      assetType: 'HVAC Equipment',
      serialNumber: 'SN-HVAC-2201',
      rfidTag: 'RFID-0001',
      iotDeviceId: 'IOT-0001',
      currentStatus: 'Active',
      utilizationStatus: 'In Use',
      lastMaintenanceDate: '2026-05-10',
      condition: 'Good'
    },
    {
      assetId: 'AST-1002',
      assetName: 'Fire Panel A',
      assetType: 'Fire Safety Equipment',
      serialNumber: 'SN-FIRE-1187',
      rfidTag: 'RFID-0002',
      iotDeviceId: 'IOT-0002',
      currentStatus: 'Active',
      utilizationStatus: 'In Use',
      lastMaintenanceDate: '2026-06-01',
      condition: 'Fair'
    },
    {
      assetId: 'AST-1003',
      assetName: 'Chiller Pump 2',
      assetType: 'Mechanical Equipment',
      serialNumber: 'SN-CHIL-0093',
      rfidTag: 'RFID-0003',
      iotDeviceId: '',
      currentStatus: 'Active',
      utilizationStatus: 'Idle',
      lastMaintenanceDate: '2026-04-22',
      condition: 'Good'
    }
  ];

  private nextSequence = 1004;

  getAssets(): AssetLinking[] {
    return this.assets;
  }

  addRecord(record: AssetLinking): AssetLinking {
    const assetId = record.assetId || `AST-${this.nextSequence++}`;
    const created: AssetLinking = { ...record, assetId };
    this.assets.push(created);
    return created;
  }

  updateRecord(assetId: string, changes: AssetLinking): void {
    const index = this.assets.findIndex((a) => a.assetId === assetId);
    if (index !== -1) {
      this.assets[index] = { ...this.assets[index], ...changes };
    }
  }

  deleteRecords(assetIds: string[]): void {
    for (let i = this.assets.length - 1; i >= 0; i--) {
      if (assetIds.includes(this.assets[i].assetId)) {
        this.assets.splice(i, 1);
      }
    }
  }

  search(term: string): AssetLinking[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.assets;
    return this.assets.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
