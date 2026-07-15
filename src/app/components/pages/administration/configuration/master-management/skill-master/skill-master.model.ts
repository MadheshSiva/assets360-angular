export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface MasterManagementSkillMasterItem {
  skillId: string;
  skillName: string;
  skillLevel: SkillLevel | '';
  certificationRequired: boolean;
}
