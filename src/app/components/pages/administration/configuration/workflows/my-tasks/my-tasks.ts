import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskAction, WorkflowInstanceService } from '../services/workflow-instance.service';
import { StepLogStatus, WorkflowTask } from '../models/workflow.model';

type TaskTab = 'Pending' | 'Approved' | 'Rejected' | 'Requested Changes';

// 6. My Tasks / Approvals — the end-user action screen (2.6 Task / Action Management).
@Component({
  standalone: true,
  selector: 'app-my-tasks',
  imports: [CommonModule, FormsModule],
  templateUrl: './my-tasks.html',
  styleUrls: ['./my-tasks.css']
})
export class MyTasks {
  activeTab: TaskTab = 'Pending';
  tabs: TaskTab[] = ['Pending', 'Approved', 'Rejected', 'Requested Changes'];

  selectedTask: WorkflowTask | null = null;
  commentText = '';

  constructor(private instanceService: WorkflowInstanceService) {}

  get allTasks(): WorkflowTask[] {
    return this.instanceService.getAllTasks();
  }

  get tasksForTab(): WorkflowTask[] {
    return this.allTasks.filter((t) => t.status === this.activeTab);
  }

  countFor(tab: TaskTab): number {
    return this.allTasks.filter((t) => t.status === tab).length;
  }

  selectTab(tab: TaskTab): void {
    this.activeTab = tab;
    this.selectedTask = null;
  }

  openTask(task: WorkflowTask): void {
    this.selectedTask = task;
    this.commentText = task.comments || '';
  }

  closePanel(): void {
    this.selectedTask = null;
    this.commentText = '';
  }

  act(action: TaskAction): void {
    if (!this.selectedTask) return;
    this.instanceService.actOnTask(this.selectedTask.instanceId, this.selectedTask.stepId, action, this.commentText);
    this.closePanel();
  }

  priorityClass(priority: string): string {
    return priority.toLowerCase();
  }

  statusOf(status: StepLogStatus): string {
    return status;
  }
}
