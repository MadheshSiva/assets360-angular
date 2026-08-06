import { Injectable } from '@angular/core';
import { LocationMaster } from './location-master.model';

@Injectable({ providedIn: 'root' })
export class LocationMasterService {
  private locations: LocationMaster[] = [
    {
      locationId: 'LOC-001',
      assetId: 'AST-1001',
      assetName: 'HVAC Unit 1',
      site: 'Dubai Mall',
      building: 'Main Building',
      floor: 'Ground Floor',
      zone: 'Zone A',
      geoCoordinates: '25.1972, 55.2796',
      parentLocationId: ''
    },
    {
      locationId: 'LOC-002',
      assetId: 'AST-1002',
      assetName: 'Fire Panel A',
      site: 'Marina Mall',
      building: 'Tower A',
      floor: '',
      zone: '',
      geoCoordinates: '25.0805, 55.1403',
      parentLocationId: ''
    },
    {
      locationId: 'LOC-003',
      assetId: 'AST-1003',
      assetName: 'Chiller Pump 2',
      site: 'Warehouse B',
      building: '',
      floor: '',
      zone: '',
      geoCoordinates: '',
      parentLocationId: 'LOC-001'
    }
  ];

  private nextSequence = 4;

  getLocations(): LocationMaster[] {
    return this.locations;
  }

  addRecord(record: LocationMaster): LocationMaster {
    const locationId = record.locationId?.trim() || `LOC-${String(this.nextSequence++).padStart(3, '0')}`;
    const created: LocationMaster = { ...record, locationId };
    this.locations = [...this.locations, created];
    return created;
  }

  updateRecord(locationId: string, changes: LocationMaster): void {
    this.locations = this.locations.map((l) => (l.locationId === locationId ? { ...l, ...changes } : l));
  }

  deleteRecords(locationIds: string[]): void {
    this.locations = this.locations.filter((l) => !locationIds.includes(l.locationId));
  }

  search(term: string): LocationMaster[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.locations;
    return this.locations.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
