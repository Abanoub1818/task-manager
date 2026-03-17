import { Injectable, computed, signal } from '@angular/core';
import { Task, TaskFilters, TaskStatus } from '../models/task.model';

export interface TaskState {
  tasks: Task[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
  filters: TaskFilters;
}

const initialFilters: TaskFilters = {
  status: 'all',
  priority: 'all',
  assigneeId: 'all',
  search: '',
};

@Injectable({ providedIn: 'root' })
export class TaskStore {
  // --- State ---
  private readonly _state = signal<TaskState>({
    tasks: [],
    loaded: false,
    loading: false,
    error: null,
    filters: initialFilters,
  });

  // --- Selectors ---
  readonly tasks = computed(() => this._state().tasks);
  readonly loaded = computed(() => this._state().loaded);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);
  readonly filters = computed(() => this._state().filters);

  readonly filteredTasks = computed(() => {
    const { tasks, filters } = this._state();
    return tasks.filter((t) => {
      const matchStatus = filters.status === 'all' || t.status === filters.status;
      const matchPriority = filters.priority === 'all' || t.priority === filters.priority;
      const matchAssignee = filters.assigneeId === 'all' || t.assignee.id === filters.assigneeId;
      const search = filters.search.toLowerCase();
      const matchSearch =
        !search ||
        t.title.toLowerCase().includes(search) ||
        t.description.toLowerCase().includes(search);
      return matchStatus && matchPriority && matchAssignee && matchSearch;
    });
  });

  readonly tasksByStatus = computed(() => {
    const tasks = this.filteredTasks();
    return {
      todo: tasks.filter((t) => t.status === 'todo'),
      in_progress: tasks.filter((t) => t.status === 'in_progress'),
      done: tasks.filter((t) => t.status === 'done'),
    };
  });

  // --- Mutations ---
  setLoading(loading: boolean): void {
    this._state.update((s) => ({ ...s, loading }));
  }

  setError(error: string | null): void {
    this._state.update((s) => ({ ...s, error, loading: false }));
  }

  setTasks(tasks: Task[]): void {
    this._state.update((s) => ({ ...s, tasks, loaded: true, loading: false, error: null }));
  }

  addTask(task: Task): void {
    this._state.update((s) => ({ ...s, tasks: [...s.tasks, task] }));
  }

  updateTask(updated: Task): void {
    this._state.update((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (t.id === updated.id ? updated : t)),
    }));
  }

  deleteTask(id: string): void {
    this._state.update((s) => ({
      ...s,
      tasks: s.tasks.filter((t) => t.id !== id),
    }));
  }

  updateTaskStatus(id: string, status: TaskStatus): void {
    this._state.update((s) => ({
      ...s,
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t,
      ),
    }));
  }

  reorderTasksInStatus(status: TaskStatus, reordered: Task[]): void {
    this._state.update((s) => {
      const others = s.tasks.filter((t) => t.status !== status);
      return { ...s, tasks: [...others, ...reordered] };
    });
  }

  setFilters(filters: Partial<TaskFilters>): void {
    this._state.update((s) => ({
      ...s,
      filters: { ...s.filters, ...filters },
    }));
  }

  resetFilters(): void {
    this._state.update((s) => ({ ...s, filters: initialFilters }));
  }
}
