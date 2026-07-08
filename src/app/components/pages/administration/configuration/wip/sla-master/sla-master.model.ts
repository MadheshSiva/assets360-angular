export interface SlaMaster {
  slaId: string;
  slaName: string;
  workType: string;
  priority: string;
  responseTimeMins: number | null;
  resolutionTimeMins: number | null;
  escalationLevel1: string;
  escalationLevel2: string;
  escalationLevel3: string;
}
