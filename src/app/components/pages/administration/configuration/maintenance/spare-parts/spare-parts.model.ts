export interface SparePartRecord {
  partId: string;
  partName: string;
  category: string;
  quantityInStock: number | null;
  minimumStockLevel: number | null;
  unitCost: number | null;
  supplier: string;
  usagePerWorkOrder: number | null;
  selected?: boolean;
}

export type SparePartForm = Omit<SparePartRecord, 'selected'>;
