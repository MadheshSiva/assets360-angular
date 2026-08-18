import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';

export interface ImportColumn {
  key: string;
  label: string;
}

@Component({
  standalone: true,
  selector: 'app-import-file-modal',
  imports: [CommonModule],
  templateUrl: './import-file-modal.html',
  styleUrls: ['./import-file-modal.css']
})
export class ImportFileModal {
  @Input() columns: ImportColumn[] = [];
  @Input() fileBaseName = 'import';
  @Output() cancelled = new EventEmitter<void>();
  @Output() imported = new EventEmitter<Record<string, string>[]>();

  selectedFile: File | null = null;
  isProcessing = false;
  errorMessage = '';

  downloadSample(): void {
    const worksheet = XLSX.utils.aoa_to_sheet([this.columns.map((c) => c.label)]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sample');
    XLSX.writeFile(workbook, `${this.fileBaseName}-sample.xlsx`);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.errorMessage = '';
  }

  onCancel(): void {
    this.selectedFile = null;
    this.errorMessage = '';
    this.isProcessing = false;
    this.cancelled.emit();
  }

  onUpload(): void {
    if (!this.selectedFile) return;
    this.isProcessing = true;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = new Uint8Array(reader.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        const labelToKey = new Map(this.columns.map((c) => [c.label.trim(), c.key]));
        const mapped = rows.map((row) => {
          const out: Record<string, string> = {};
          Object.entries(row).forEach(([label, value]) => {
            const key = labelToKey.get(label.trim()) ?? label;
            out[key] = String(value ?? '');
          });
          return out;
        });

        this.isProcessing = false;
        this.selectedFile = null;
        this.imported.emit(mapped);
      } catch {
        this.isProcessing = false;
        this.errorMessage = 'Could not read this file. Please upload a valid Excel file.';
      }
    };
    reader.onerror = () => {
      this.isProcessing = false;
      this.errorMessage = 'Could not read this file. Please upload a valid Excel file.';
    };
    reader.readAsArrayBuffer(this.selectedFile);
  }
}
