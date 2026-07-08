import { Injectable } from '@angular/core';
import { ResourceMaster } from './resource-master.model';

@Injectable({ providedIn: 'root' })
export class ResourceMasterService {
  readonly resourceTypeMaster: string[] = ['Technician', 'Contractor', 'Engineer'];

  readonly skillMaster: string[] = [
    'Electrical',
    'Mechanical',
    'HVAC',
    'Plumbing',
    'Fire Safety',
    'Instrumentation',
    'Welding',
    'IT Support'
  ];

  readonly departmentMaster: string[] = ['Facilities', 'Electrical', 'Mechanical', 'IT', 'Safety'];

  readonly availabilityStatusMaster: string[] = ['Available', 'Busy', 'On Leave', 'Unavailable'];

  readonly shiftMaster: { id: string; name: string }[] = [
    { id: 'SHF-001', name: 'Morning Shift (06:00 - 14:00)' },
    { id: 'SHF-002', name: 'Afternoon Shift (14:00 - 22:00)' },
    { id: 'SHF-003', name: 'Night Shift (22:00 - 06:00)' }
  ];

  private resources: ResourceMaster[] = [
    {
      resourceId: 'RES-1001',
      resourceName: 'John Mathew',
      resourceType: 'Technician',
      skillSet: ['Electrical', 'Fire Safety'],
      departmentId: 'Electrical',
      contactNumber: '+971 50 123 4567',
      email: 'john.mathew@example.com',
      availabilityStatus: 'Available',
      shiftId: 'SHF-001',
      costPerHour: 45,
      certificationDetails: 'Certified Electrical Safety Technician (2025)',
      status: true
    },
    {
      resourceId: 'RES-1002',
      resourceName: 'Ali Hassan',
      resourceType: 'Contractor',
      skillSet: ['HVAC', 'Mechanical'],
      departmentId: 'Mechanical',
      contactNumber: '+971 55 987 6543',
      email: 'ali.hassan@example.com',
      availabilityStatus: 'Busy',
      shiftId: 'SHF-002',
      costPerHour: 60,
      certificationDetails: 'HVAC Systems Contractor License',
      status: true
    }
  ];

  private nextSequence = 1003;

  getResources(): ResourceMaster[] {
    return this.resources;
  }

  addRecord(record: ResourceMaster): ResourceMaster {
    const resourceId = record.resourceId || `RES-${this.nextSequence++}`;
    const created: ResourceMaster = { ...record, resourceId };
    this.resources = [...this.resources, created];
    return created;
  }

  updateRecord(resourceId: string, changes: ResourceMaster): void {
    this.resources = this.resources.map((r) => (r.resourceId === resourceId ? { ...r, ...changes } : r));
  }

  deleteRecords(resourceIds: string[]): void {
    this.resources = this.resources.filter((r) => !resourceIds.includes(r.resourceId));
  }

  search(term: string): ResourceMaster[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.resources;
    return this.resources.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
