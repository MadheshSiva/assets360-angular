import { Injectable } from '@angular/core';
import {
  CertificationTypeMasterStatus,
  CertificationTypeRenewalRequired,
  MasterManagementCertificationTypeMasterItem
} from './certification-type-master.model';

@Injectable({ providedIn: 'root' })
export class MasterManagementCertificationTypeMasterService {
  readonly applicableAssetTypeMaster: string[] = ['IT Equipment', 'Vehicle', 'Machinery', 'Furniture', 'Safety Equipment'];
  readonly renewalRequiredMaster: CertificationTypeRenewalRequired[] = ['Yes', 'No'];
  readonly statusMaster: CertificationTypeMasterStatus[] = ['Active', 'Inactive'];

  private readonly records: MasterManagementCertificationTypeMasterItem[] = [
    {
      certificationTypeId: 'CRT-1001',
      certificationName: 'ISO 9001 Quality Management',
      certificationCode: 'ISO-9001',
      description: 'Quality management system certification for organizational processes',
      applicableAssetType: 'Machinery',
      issuingAuthority: 'International Organization for Standardization',
      validityPeriodDays: 1095,
      renewalRequired: 'Yes',
      status: 'Active'
    },
    {
      certificationTypeId: 'CRT-1002',
      certificationName: 'ISO 27001 Information Security',
      certificationCode: 'ISO-27001',
      description: 'Information security management system certification',
      applicableAssetType: 'IT Equipment',
      issuingAuthority: 'International Organization for Standardization',
      validityPeriodDays: 1095,
      renewalRequired: 'Yes',
      status: 'Active'
    },
    {
      certificationTypeId: 'CRT-1003',
      certificationName: 'Calibration Certificate',
      certificationCode: 'CAL-CERT',
      description: 'Confirms measuring equipment is calibrated to required accuracy',
      applicableAssetType: 'Machinery',
      issuingAuthority: 'Emirates Authority for Standardization and Metrology',
      validityPeriodDays: 365,
      renewalRequired: 'Yes',
      status: 'Active'
    },
    {
      certificationTypeId: 'CRT-1004',
      certificationName: 'Vehicle Roadworthiness Certificate',
      certificationCode: 'VEH-ROADWORTHY',
      description: 'Confirms a vehicle meets safety and roadworthiness standards',
      applicableAssetType: 'Vehicle',
      issuingAuthority: 'Roads and Transport Authority',
      validityPeriodDays: 365,
      renewalRequired: 'Yes',
      status: 'Active'
    }
  ];

  private nextSequence = 1005;

  getRecords(): MasterManagementCertificationTypeMasterItem[] {
    return this.records;
  }

  addRecord(record: MasterManagementCertificationTypeMasterItem): MasterManagementCertificationTypeMasterItem {
    const certificationTypeId = record.certificationTypeId?.trim() || `CRT-${this.nextSequence++}`;
    const created: MasterManagementCertificationTypeMasterItem = { ...record, certificationTypeId };
    this.records.push(created);
    return created;
  }

  updateRecord(certificationTypeId: string, changes: MasterManagementCertificationTypeMasterItem): void {
    const index = this.records.findIndex((r) => r.certificationTypeId === certificationTypeId);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(certificationTypeIds: string[]): void {
    for (const id of certificationTypeIds) {
      const index = this.records.findIndex((r) => r.certificationTypeId === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): MasterManagementCertificationTypeMasterItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
