export interface MasterManagementMasterItem {
  maintenanceId: string;
  assetId: string;
  assetName: string;
  maintenanceCode: string;
  maintenanceName: string;
  maintenanceCategory: string;
  frequency: string;
  standardDurationHours: number | null;
  description: string;
  isActive: boolean;
}
