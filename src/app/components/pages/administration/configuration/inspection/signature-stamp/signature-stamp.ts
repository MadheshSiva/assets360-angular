import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';
import { InspectionSignatureStampItem, InspectionSignatureStampRow } from './signature-stamp.model';
import { InspectionSignatureStampService } from './signature-stamp.service';

interface InspectionSignatureStampColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-inspection-signature-stamp',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './signature-stamp.html',
  styleUrls: ['./signature-stamp.css']
})
export class InspectionSignatureStamp {
  searchTerm = '';

  columns: InspectionSignatureStampColumn[] = [
    { key: 'signatureCode', label: 'Signature Code', visible: true },
    { key: 'user', label: 'User', visible: true },
    { key: 'signatureName', label: 'Signature Name', visible: true },
    { key: 'signatureImage', label: 'Signature Image', visible: true },
    { key: 'stampImage', label: 'Stamp Image', visible: true },
    { key: 'digitalSignatureCertificate', label: 'Digital Signature Certificate', visible: true },
    { key: 'effectiveDate', label: 'Effective Date', visible: true },
    { key: 'expiryDate', label: 'Expiry Date', visible: true },
    { key: 'defaultSignature', label: 'Default Signature', visible: true },
    { key: 'defaultStamp', label: 'Default Stamp', visible: true },
    { key: 'allowManualSignature', label: 'Allow Manual Signature', visible: true },
    { key: 'allowUploadedSignature', label: 'Allow Uploaded Signature', visible: true },
    { key: 'allowBoth', label: 'Allow Both', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'passwordConfirmationBeforeSigning', label: 'Password Confirmation Before Signing', visible: true },
    { key: 'otpConfirmation', label: 'OTP Confirmation', visible: true },
    { key: 'signatureUsageLog', label: 'Signature Usage Log', visible: true },
    { key: 'ipAddress', label: 'IP Address', visible: true },
    { key: 'deviceInformation', label: 'Device Information', visible: true },
    { key: 'timestamp', label: 'Timestamp', visible: true },
    { key: 'signatureHash', label: 'Signature Hash', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'signatureCode', label: 'Signature Code' },
    { key: 'user', label: 'User' },
    { key: 'signatureName', label: 'Signature Name' },
    { key: 'signatureImage', label: 'Signature Image' },
    { key: 'stampImage', label: 'Stamp Image' },
    { key: 'digitalSignatureCertificate', label: 'Digital Signature Certificate' },
    { key: 'effectiveDate', label: 'Effective Date' },
    { key: 'expiryDate', label: 'Expiry Date' },
    { key: 'defaultSignature', label: 'Default Signature' },
    { key: 'defaultStamp', label: 'Default Stamp' },
    { key: 'allowManualSignature', label: 'Allow Manual Signature' },
    { key: 'allowUploadedSignature', label: 'Allow Uploaded Signature' },
    { key: 'allowBoth', label: 'Allow Both' },
    { key: 'status', label: 'Status' },
    { key: 'passwordConfirmationBeforeSigning', label: 'Password Confirmation Before Signing' },
    { key: 'otpConfirmation', label: 'OTP Confirmation' },
    { key: 'signatureUsageLog', label: 'Signature Usage Log' },
    { key: 'ipAddress', label: 'IP Address' },
    { key: 'deviceInformation', label: 'Device Information' },
    { key: 'timestamp', label: 'Timestamp' },
    { key: 'signatureHash', label: 'Signature Hash' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: InspectionSignatureStampRow[] = [];
  filteredRecords: InspectionSignatureStampRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: InspectionSignatureStampRow | null = null;

  form: InspectionSignatureStampItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: InspectionSignatureStampService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.refresh();
    this.handleDeepLink();
  }

  private handleDeepLink(): void {
    const params = this.route.snapshot.queryParamMap;
    const action = params.get('linkAction');
    if (!action) return;

    this.returnUrl = params.get('linkReturn');

    if (action === 'create') {
      this.onCreate();
    } else if (action === 'edit') {
      const value = params.get('linkValue') ?? '';
      const match = this.records.find((r) => r.signatureName === value);
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
  }

  onSignatureImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.form.signatureImage = input.files && input.files[0] ? input.files[0].name : '';
  }

  onStampImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.form.stampImage = input.files && input.files[0] ? input.files[0].name : '';
  }

  private emptyForm(): InspectionSignatureStampItem {
    return {
      signatureCode: '',
      user: '',
      signatureName: '',
      signatureImage: '',
      stampImage: '',
      digitalSignatureCertificate: '',
      effectiveDate: '',
      expiryDate: '',
      defaultSignature: false,
      defaultStamp: false,
      allowManualSignature: false,
      allowUploadedSignature: false,
      allowBoth: false,
      status: true,
      passwordConfirmationBeforeSigning: false,
      otpConfirmation: false,
      signatureUsageLog: '',
      ipAddress: '',
      deviceInformation: '',
      timestamp: '',
      signatureHash: ''
    };
  }

  private refresh(): void {
    this.records = this.service.getRecords();
    this.onSearch();
  }

  isColumnVisible(key: string): boolean {
    return this.columns.find((c) => c.key === key)?.visible ?? true;
  }

  toggleColumnPicker(): void {
    this.showColumnPicker = !this.showColumnPicker;
  }

  closeColumnPicker(): void {
    this.showColumnPicker = false;
  }

  toggleColumn(col: InspectionSignatureStampColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): InspectionSignatureStampRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: InspectionSignatureStampRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as InspectionSignatureStampRow[];
  }

  onRefresh(): void {
    this.searchTerm = '';
    this.refresh();
  }

  onCreate(): void {
    this.isEditMode = false;
    this.editingRecord = null;
    this.form = this.emptyForm();
    this.showFormModal = true;
  }

  onEdit(): void {
    if (this.selectedRecords.length !== 1) return;
    this.editRow(this.selectedRecords[0]);
  }

  editRow(record: InspectionSignatureStampRow): void {
    this.isEditMode = true;
    this.editingRecord = record;
    const { selected, ...rest } = record;
    this.form = { ...rest };
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.editingRecord = null;
    if (this.returnUrl) {
      this.router.navigateByUrl(this.returnUrl);
    }
  }

  submitForm(): void {
    if (this.isEditMode && this.editingRecord) {
      this.service.updateRecord(this.editingRecord.signatureCode, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.signatureCode));
    this.refresh();
  }

  deleteRow(record: InspectionSignatureStampRow): void {
    this.service.deleteRecords([record.signatureCode]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      const boolField = (key: string) => {
        const raw = (row[key] ?? '').trim().toLowerCase();
        return raw === 'yes' || raw === 'true';
      };
      this.service.addRecord({
        signatureCode: row['signatureCode'] ?? '',
        user: row['user'] ?? '',
        signatureName: row['signatureName'] ?? '',
        signatureImage: row['signatureImage'] ?? '',
        stampImage: row['stampImage'] ?? '',
        digitalSignatureCertificate: row['digitalSignatureCertificate'] ?? '',
        effectiveDate: row['effectiveDate'] ?? '',
        expiryDate: row['expiryDate'] ?? '',
        defaultSignature: boolField('defaultSignature'),
        defaultStamp: boolField('defaultStamp'),
        allowManualSignature: boolField('allowManualSignature'),
        allowUploadedSignature: boolField('allowUploadedSignature'),
        allowBoth: boolField('allowBoth'),
        status: boolField('status'),
        passwordConfirmationBeforeSigning: boolField('passwordConfirmationBeforeSigning'),
        otpConfirmation: boolField('otpConfirmation'),
        signatureUsageLog: row['signatureUsageLog'] ?? '',
        ipAddress: row['ipAddress'] ?? '',
        deviceInformation: row['deviceInformation'] ?? '',
        timestamp: row['timestamp'] ?? '',
        signatureHash: row['signatureHash'] ?? ''
      });
    });
    this.refresh();
    this.showImportModal = false;
  }

  onDownload(): void {
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
