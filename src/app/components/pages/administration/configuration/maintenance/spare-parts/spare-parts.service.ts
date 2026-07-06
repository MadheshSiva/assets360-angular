import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SparePartRecord } from './spare-parts.model';

/**
 * Standalone data/master layer for the Spare Parts sub-module, kept independent of the
 * other Maintenance sub-modules so it can be pointed at its own backend microservice
 * (e.g. an inventory service) without touching the rest of the Maintenance feature set.
 */
@Injectable({ providedIn: 'root' })
export class SparePartsService {
  readonly sparePartsMaster: { id: string; name: string }[] = [
    { id: 'SP-1001', name: 'Air Filter' },
    { id: 'SP-1002', name: 'V-Belt' },
    { id: 'SP-1003', name: 'Bearing 608' },
    { id: 'SP-1004', name: 'Grease Cartridge' }
  ];

  readonly partsCategoryMaster: string[] = ['Filters', 'Belts', 'Bearings', 'Electrical', 'Consumables'];
  readonly vendorMaster: string[] = ['ABC Traders', 'Gulf Spares Co.', 'Prime Industrial Supplies'];

  private readonly partsSubject = new BehaviorSubject<SparePartRecord[]>([
    {
      partId: 'SP-1001',
      partName: 'Air Filter',
      category: 'Filters',
      quantityInStock: 24,
      minimumStockLevel: 10,
      unitCost: 35,
      supplier: 'ABC Traders',
      usagePerWorkOrder: 1
    },
    {
      partId: 'SP-1002',
      partName: 'V-Belt',
      category: 'Belts',
      quantityInStock: 6,
      minimumStockLevel: 8,
      unitCost: 18,
      supplier: 'Gulf Spares Co.',
      usagePerWorkOrder: 2
    }
  ]);

  getParts(): SparePartRecord[] {
    return this.partsSubject.value;
  }

  partName(partId: string): string {
    return this.sparePartsMaster.find((p) => p.id === partId)?.name ?? '';
  }

  addPart(part: SparePartRecord): void {
    this.partsSubject.next([...this.partsSubject.value, part]);
  }

  updatePart(original: SparePartRecord, changes: SparePartRecord): void {
    this.partsSubject.next(
      this.partsSubject.value.map((p) => (p === original ? { ...p, ...changes } : p))
    );
  }

  deleteParts(items: SparePartRecord[]): void {
    this.partsSubject.next(this.partsSubject.value.filter((p) => !items.includes(p)));
  }

  search(term: string): SparePartRecord[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.partsSubject.value;
    return this.partsSubject.value.filter((p) =>
      Object.values(p).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
