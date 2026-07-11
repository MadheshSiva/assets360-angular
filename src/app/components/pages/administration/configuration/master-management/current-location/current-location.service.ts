import { Injectable } from '@angular/core';
import { MasterManagementCurrentLocationItem } from './current-location.model';

type ProjectHierarchy = Record<string, Record<string, Record<string, string[]>>>;

@Injectable({ providedIn: 'root' })
export class MasterManagementCurrentLocationService {
  readonly projectHierarchy: ProjectHierarchy = {
    'Site A': {
      'Building 1': {
        'Zone North': ['Room 101', 'Room 102'],
        'Zone South': ['Room 103']
      },
      'Building 2': {
        'Zone East': ['Room 201']
      }
    },
    'Site B': {
      'Building 3': {
        'Zone West': ['Room 301', 'Room 302']
      }
    }
  };

  get siteMaster(): string[] {
    return Object.keys(this.projectHierarchy);
  }

  getBuildings(site: string): string[] {
    return site ? Object.keys(this.projectHierarchy[site] ?? {}) : [];
  }

  getZones(site: string, building: string): string[] {
    return site && building ? Object.keys(this.projectHierarchy[site]?.[building] ?? {}) : [];
  }

  getRooms(site: string, building: string, zone: string): string[] {
    return site && building && zone ? this.projectHierarchy[site]?.[building]?.[zone] ?? [] : [];
  }

  private readonly records: MasterManagementCurrentLocationItem[] = [
    {
      locationId: 'LOC-1001',
      site: 'Site A',
      building: 'Building 1',
      zone: 'Zone North',
      room: 'Room 101',
      isActive: true
    },
    {
      locationId: 'LOC-1002',
      site: 'Site A',
      building: 'Building 2',
      zone: 'Zone East',
      room: 'Room 201',
      isActive: true
    },
    {
      locationId: 'LOC-1003',
      site: 'Site B',
      building: 'Building 3',
      zone: 'Zone West',
      room: 'Room 301',
      isActive: true
    },
    {
      locationId: 'LOC-1004',
      site: 'Site B',
      building: 'Building 3',
      zone: 'Zone West',
      room: 'Room 302',
      isActive: false
    }
  ];

  private nextSequence = 1005;

  getRecords(): MasterManagementCurrentLocationItem[] {
    return this.records;
  }

  addRecord(record: MasterManagementCurrentLocationItem): MasterManagementCurrentLocationItem {
    const locationId = record.locationId?.trim() || `LOC-${this.nextSequence++}`;
    const created: MasterManagementCurrentLocationItem = { ...record, locationId };
    this.records.push(created);
    return created;
  }

  updateRecord(locationId: string, changes: MasterManagementCurrentLocationItem): void {
    const index = this.records.findIndex((r) => r.locationId === locationId);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(locationIds: string[]): void {
    for (const id of locationIds) {
      const index = this.records.findIndex((r) => r.locationId === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): MasterManagementCurrentLocationItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
