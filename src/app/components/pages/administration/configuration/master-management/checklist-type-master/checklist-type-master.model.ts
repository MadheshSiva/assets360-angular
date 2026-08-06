export type ApplicableModule = 'Asset' | 'Maintenance' | 'WIP' | 'Inspection' | 'Safety';

export interface MasterManagementChecklistTypeMasterItem {
  typeId: string;
  assetId: string;
  assetName: string;
  typeName: string;
  applicableModule: ApplicableModule | '';
  isActive: boolean;
}
