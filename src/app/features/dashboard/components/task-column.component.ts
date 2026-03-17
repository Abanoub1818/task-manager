import { Component, input, output, signal } from '@angular/core';
import { Task, TaskStatus } from '../../../core/models/task.model';
import { TaskCardComponent } from '../../../shared/components/task-card/task-card.component';
import { SkeletonModule } from 'primeng/skeleton';

// Shared drag state across all column instances
let _draggedTask: Task | null = null;
let _draggedFromStatus: TaskStatus | null = null;

@Component({
  selector: 'app-task-column',
  standalone: true,
  imports: [TaskCardComponent, SkeletonModule],
  templateUrl: './task-column.component.html',
  styleUrl: './task-column.component.scss',
})
export class TaskColumnComponent {
  readonly title = input.required<string>();
  readonly status = input.required<TaskStatus>();
  readonly tasks = input<Task[]>([]);
  readonly loading = input<boolean>(false);

  readonly editTask = output<Task>();
  readonly deleteTask = output<string>();
  readonly cancelDelete = output<void>();
  readonly statusChange = output<{ id: string; status: TaskStatus }>();
  readonly reorder = output<{ status: TaskStatus; tasks: Task[] }>();

  readonly dragOverIndex = signal(-1);
  readonly isDragOver = signal(false);

  onDragStart(task: Task): void {
    _draggedTask = task;
    _draggedFromStatus = task.status;
  }

  onDragEnd(): void {
    _draggedTask = null;
    _draggedFromStatus = null;
    this.dragOverIndex.set(-1);
    this.isDragOver.set(false);
  }

  onCardDragOver(e: DragEvent, index: number): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragOver.set(true);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    this.dragOverIndex.set(e.clientY > rect.top + rect.height / 2 ? index + 1 : index);
  }

  onColumnDragOver(e: DragEvent): void {
    e.preventDefault();
    this.isDragOver.set(true);
    if (this.dragOverIndex() === -1) this.dragOverIndex.set(this.tasks().length);
  }

  onColumnDragLeave(e: DragEvent, colEl: HTMLElement): void {
    if (!colEl.contains(e.relatedTarget as Node)) {
      this.isDragOver.set(false);
      this.dragOverIndex.set(-1);
    }
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    const task = _draggedTask;
    if (!task) return;

    const targetStatus = this.status();
    const dropIndex = this.dragOverIndex() === -1 ? this.tasks().length : this.dragOverIndex();

    if (_draggedFromStatus === targetStatus) {
      const list = [...this.tasks()];
      const from = list.findIndex((t) => t.id === task.id);
      if (from !== -1) {
        list.splice(from, 1);
        list.splice(dropIndex > from ? dropIndex - 1 : dropIndex, 0, task);
        this.reorder.emit({ status: targetStatus, tasks: list });
      }
    } else {
      this.statusChange.emit({ id: task.id, status: targetStatus });
    }

    this.isDragOver.set(false);
    this.dragOverIndex.set(-1);
  }

  isDragging(task: Task): boolean {
    return _draggedTask?.id === task.id;
  }
}
