import { Injectable, inject } from '@angular/core';
import { TaskApiService } from '../services/task-api.service';
import { TaskStore } from '../store/task.store';
import { NotificationService } from '../services/notification.service';
import { Task, TaskFilters, TaskStatus } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskFacade {
  private readonly api = inject(TaskApiService);
  private readonly store = inject(TaskStore);
  private readonly notify = inject(NotificationService);

  readonly tasks = this.store.tasks;
  readonly filteredTasks = this.store.filteredTasks;
  readonly tasksByStatus = this.store.tasksByStatus;
  readonly loading = this.store.loading;
  readonly error = this.store.error;
  readonly filters = this.store.filters;

  loadTasks(): void {
    if (this.store.loaded()) return; // store is the cache
    this.store.setLoading(true);
    this.api.getTasks().subscribe({
      next: (res) => this.store.setTasks(res.tasks),
      error: (err) => this.store.setError(err.message),
    });
  }

  createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): void {
    this.api.createTask(task).subscribe({
      next: (created) => {
        this.store.addTask(created);
        this.notify.success('Task Created', `"${created.title}" has been added.`);
      },
      error: (err) => {
        this.store.setError(err.message);
        this.notify.error('Error', 'Failed to create task.');
      },
    });
  }

  updateTask(id: string, changes: Partial<Task>): void {
    this.api.updateTask(id, changes).subscribe({
      next: (updated) => {
        this.store.updateTask(updated);
        this.notify.success('Task Updated', `"${updated.title}" has been updated.`);
      },
      error: (err) => {
        this.store.setError(err.message);
        this.notify.error('Error', 'Failed to update task.');
      },
    });
  }

  deleteTask(id: string): void {
    const title = this.store.tasks().find((t) => t.id === id)?.title ?? 'Task';
    this.api.deleteTask(id).subscribe({
      next: () => {
        this.store.deleteTask(id);
        this.notify.success('Task Deleted', `"${title}" has been deleted.`);
      },
      error: (err) => {
        this.store.setError(err.message);
        this.notify.error('Error', 'Failed to delete task.');
      },
    });
  }

  cancelDelete(): void {
    this.notify.info('Cancelled', 'Task deletion was cancelled.');
  }

  cancelForm(): void {
    this.notify.info('Cancelled', 'No changes were saved.');
  }

  updateTaskStatus(id: string, status: TaskStatus): void {
    this.store.updateTaskStatus(id, status);
    this.api.updateTask(id, { status }).subscribe({
      error: (err) => this.store.setError(err.message),
    });
  }

  reorderTasksInStatus(status: TaskStatus, tasks: Task[]): void {
    this.store.reorderTasksInStatus(status, tasks);
  }

  setFilters(filters: Partial<TaskFilters>): void {
    this.store.setFilters(filters);
  }

  resetFilters(): void {
    this.store.resetFilters();
  }
}
