export type ApplicableModule = 'Asset' | 'Maintenance' | 'WIP' | 'Inspection' | 'Safety';

export interface MasterManagementChecklistTypeMasterItem {
  typeId: string;
  typeName: string;
  applicableModule: ApplicableModule | '';
  isActive: boolean;
}
