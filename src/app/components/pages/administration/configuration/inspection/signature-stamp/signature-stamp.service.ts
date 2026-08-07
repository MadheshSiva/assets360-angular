import { Injectable } from '@angular/core';
import { InspectionSignatureStampItem } from './signature-stamp.model';

@Injectable({ providedIn: 'root' })
export class InspectionSignatureStampService {
  private readonly records: InspectionSignatureStampItem[] = [
    {
      signatureCode: 'SIG-1001',
      user: 'David Smith',
      signatureName: 'David Smith - Primary',
      signatureImage: 'david-signature.png',
      stampImage: 'david-stamp.png',
      digitalSignatureCertificate: 'CERT-2026-0041',
      effectiveDate: '2026-01-01',
      expiryDate: '2027-01-01',
      defaultSignature: true,
      defaultStamp: true,
      allowManualSignature: true,
      allowUploadedSignature: true,
      allowBoth: true,
      status: true,
      passwordConfirmationBeforeSigning: true,
      otpConfirmation: true,
      signatureUsageLog: '18 uses',
      ipAddress: '203.0.113.10',
      deviceInformation: 'Windows 11 / Chrome',
      timestamp: '2026-08-01 10:15',
      signatureHash: 'a1b2c3d4e5f6'
    },
    {
      signatureCode: 'SIG-1002',
      user: 'Sarah Wilson',
      signatureName: 'Sarah Wilson - QA',
      signatureImage: 'sarah-signature.png',
      stampImage: 'sarah-stamp.png',
      digitalSignatureCertificate: 'CERT-2026-0088',
      effectiveDate: '2026-02-01',
      expiryDate: '2027-02-01',
      defaultSignature: false,
      defaultStamp: false,
      allowManualSignature: true,
      allowUploadedSignature: true,
      allowBoth: false,
      status: true,
      passwordConfirmationBeforeSigning: false,
      otpConfirmation: true,
      signatureUsageLog: '6 uses',
      ipAddress: '203.0.113.44',
      deviceInformation: 'macOS / Safari',
      timestamp: '2026-07-28 14:02',
      signatureHash: 'f6e5d4c3b2a1'
    }
  ];

  private nextSequence = 1003;

  getRecords(): InspectionSignatureStampItem[] {
    return this.records;
  }

  addRecord(record: InspectionSignatureStampItem): InspectionSignatureStampItem {
    const signatureCode = record.signatureCode?.trim() || `SIG-${this.nextSequence++}`;
    const created: InspectionSignatureStampItem = { ...record, signatureCode };
    this.records.push(created);
    return created;
  }

  updateRecord(signatureCode: string, changes: InspectionSignatureStampItem): void {
    const index = this.records.findIndex((r) => r.signatureCode === signatureCode);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(signatureCodes: string[]): void {
    for (const code of signatureCodes) {
      const index = this.records.findIndex((r) => r.signatureCode === code);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): InspectionSignatureStampItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
