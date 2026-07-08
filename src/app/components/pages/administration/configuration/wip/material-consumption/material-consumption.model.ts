export interface MaterialConsumption {
  materialId: string;
  jobId: string;
  taskId: string;
  itemName: string;
  itemCode: string;
  quantityPlanned: number | null;
  quantityUsed: number | null;
  unit: string;
  cost: number | null;
  vendorId: string;
}
