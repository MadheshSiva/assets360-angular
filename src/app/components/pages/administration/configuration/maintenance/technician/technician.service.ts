import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TechnicianRecord } from './technician.model';

/**
 * Standalone data/master layer for the Technician sub-module, kept independent of the
 * other Maintenance sub-modules so it can be pointed at its own backend microservice
 * (e.g. an HR/workforce service) without touching the rest of the Maintenance feature set.
 */
@Injectable({ providedIn: 'root' })
export class TechnicianService {
  readonly technicianMaster: { id: string; name: string }[] = [
    { id: 'TECH-001', name: 'John Mathew' },
    { id: 'TECH-002', name: 'Ali Hassan' },
    { id: 'TECH-003', name: 'Priya Nair' },
    { id: 'TECH-004', name: 'Carlos Diaz' }
  ];

  readonly skillMaster: string[] = ['HVAC', 'Electrical', 'Plumbing', 'Fire Safety', 'Instrumentation'];
  readonly certificationMaster: string[] = [
    'OSHA Certified',
    'Electrical Safety Certified',
    'HVAC Technician License',
    'Fire Safety Certified'
  ];
  readonly availabilityMaster: string[] = ['Available', 'On Leave', 'Busy', 'Off Duty'];

  private readonly techniciansSubject = new BehaviorSubject<TechnicianRecord[]>([
    {
      technicianId: 'TECH-001',
      name: 'John Mathew',
      skillSet: 'HVAC',
      certification: 'HVAC Technician License',
      availability: 'Available',
      assignedTasks: 2
    },
    {
      technicianId: 'TECH-002',
      name: 'Ali Hassan',
      skillSet: 'Electrical',
      certification: 'Electrical Safety Certified',
      availability: 'Busy',
      assignedTasks: 4
    }
  ]);

  getTechnicians(): TechnicianRecord[] {
    return this.techniciansSubject.value;
  }

  technicianName(technicianId: string): string {
    return this.technicianMaster.find((t) => t.id === technicianId)?.name ?? '';
  }

  addTechnician(technician: TechnicianRecord): void {
    this.techniciansSubject.next([...this.techniciansSubject.value, technician]);
  }

  updateTechnician(original: TechnicianRecord, changes: TechnicianRecord): void {
    this.techniciansSubject.next(
      this.techniciansSubject.value.map((t) => (t === original ? { ...t, ...changes } : t))
    );
  }

  deleteTechnicians(items: TechnicianRecord[]): void {
    this.techniciansSubject.next(this.techniciansSubject.value.filter((t) => !items.includes(t)));
  }

  search(term: string): TechnicianRecord[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.techniciansSubject.value;
    return this.techniciansSubject.value.filter((t) =>
      Object.values(t).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
