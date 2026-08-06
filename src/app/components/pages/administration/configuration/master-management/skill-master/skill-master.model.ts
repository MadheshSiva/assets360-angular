export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface MasterManagementSkillMasterItem {
  skillId: string;
  assetId: string;
  assetName: string;
  skillName: string;
  skillLevel: SkillLevel | '';
  certificationRequired: boolean;
}
