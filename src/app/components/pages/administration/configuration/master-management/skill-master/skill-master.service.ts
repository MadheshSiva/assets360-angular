import { Injectable } from '@angular/core';
import { MasterManagementSkillMasterItem, SkillLevel } from './skill-master.model';

@Injectable({ providedIn: 'root' })
export class MasterManagementSkillMasterService {
  readonly skillLevelMaster: SkillLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  private readonly records: MasterManagementSkillMasterItem[] = [
    {
      skillId: 'SKL-1001',
      skillName: 'Electrical Safety',
      skillLevel: 'Advanced',
      certificationRequired: true
    },
    {
      skillId: 'SKL-1002',
      skillName: 'Forklift Operation',
      skillLevel: 'Intermediate',
      certificationRequired: true
    },
    {
      skillId: 'SKL-1003',
      skillName: 'First Aid & CPR',
      skillLevel: 'Beginner',
      certificationRequired: false
    },
    {
      skillId: 'SKL-1004',
      skillName: 'Confined Space Entry',
      skillLevel: 'Expert',
      certificationRequired: true
    }
  ];

  private nextSequence = 1005;

  getRecords(): MasterManagementSkillMasterItem[] {
    return this.records;
  }

  addRecord(record: MasterManagementSkillMasterItem): MasterManagementSkillMasterItem {
    const skillId = record.skillId?.trim() || `SKL-${this.nextSequence++}`;
    const created: MasterManagementSkillMasterItem = { ...record, skillId };
    this.records.push(created);
    return created;
  }

  updateRecord(skillId: string, changes: MasterManagementSkillMasterItem): void {
    const index = this.records.findIndex((r) => r.skillId === skillId);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(skillIds: string[]): void {
    for (const id of skillIds) {
      const index = this.records.findIndex((r) => r.skillId === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): MasterManagementSkillMasterItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
