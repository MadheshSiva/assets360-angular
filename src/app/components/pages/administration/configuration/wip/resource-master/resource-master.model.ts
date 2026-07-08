export type ResourceMasterType = 'Technician' | 'Contractor' | 'Engineer';
export type ResourceMasterAvailability = 'Available' | 'Busy' | 'On Leave' | 'Unavailable';

export interface ResourceMaster {
  resourceId: string;
  resourceName: string;
  resourceType: ResourceMasterType | '';
  skillSet: string[];
  departmentId: string;
  contactNumber: string;
  email: string;
  availabilityStatus: ResourceMasterAvailability | '';
  shiftId: string;
  costPerHour: number | null;
  certificationDetails: string;
  status: boolean;
}
