import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MaintenanceTaskRecord } from './maintenance-task.model';

/**
 * Standalone data/master layer for the Maintenance Task sub-module, kept independent of
 * the other Maintenance sub-modules so it can be pointed at its own backend microservice
 * without touching the rest of the Maintenance feature set.
 */
@Injectable({ providedIn: 'root' })
export class MaintenanceTaskService {
  readonly checklistMaster: string[] = [
    'Visual Inspection',
    'Lubrication Check',
    'Filter Replacement',
    'Belt Tension Check',
    'Electrical Continuity Test'
  ];

  readonly toolsMaster: string[] = ['Multimeter', 'Torque Wrench', 'Grease Gun', 'Vacuum Cleaner', 'Ladder'];

  private readonly tasksSubject = new BehaviorSubject<MaintenanceTaskRecord[]>([
    {
      taskChecklist: ['Visual Inspection', 'Lubrication Check'],
      instructions: 'Inspect belts and lubricate bearings as per OEM guidelines.',
      toolsRequired: 'Grease Gun',
      safetyProcedures: 'Lock out / tag out the equipment before servicing.',
      estimatedDuration: 45,
      completionNotes: ''
    },
    {
      taskChecklist: ['Filter Replacement'],
      instructions: 'Replace the primary intake filter and check air flow.',
      toolsRequired: 'Vacuum Cleaner',
      safetyProcedures: 'Wear a dust mask while handling used filters.',
      estimatedDuration: 30,
      completionNotes: ''
    }
  ]);

  getTasks(): MaintenanceTaskRecord[] {
    return this.tasksSubject.value;
  }

  addTask(task: MaintenanceTaskRecord): void {
    this.tasksSubject.next([...this.tasksSubject.value, task]);
  }

  updateTask(original: MaintenanceTaskRecord, changes: MaintenanceTaskRecord): void {
    this.tasksSubject.next(
      this.tasksSubject.value.map((t) => (t === original ? { ...t, ...changes } : t))
    );
  }

  deleteTasks(items: MaintenanceTaskRecord[]): void {
    this.tasksSubject.next(this.tasksSubject.value.filter((t) => !items.includes(t)));
  }

  search(term: string): MaintenanceTaskRecord[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.tasksSubject.value;
    return this.tasksSubject.value.filter((t) =>
      [t.taskChecklist.join(', '), t.instructions, t.toolsRequired, t.safetyProcedures, t.completionNotes].some(
        (v) => v.toLowerCase().includes(value)
      )
    );
  }
}
