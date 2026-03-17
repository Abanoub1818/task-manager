import { Component, input, output } from '@angular/core';
import { TaskFilters, TaskPriority, TaskStatus } from '../../../core/models/task.model';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

type StatusTab = { label: string; value: TaskStatus | 'all' };

@Component({
  selector: 'app-task-filter-bar',
  standalone: true,
  imports: [NgClass, FormsModule],
  templateUrl: './task-filter-bar.component.html',
  styleUrl: './task-filter-bar.component.scss',
})
export class TaskFilterBarComponent {
  readonly filters = input.required<TaskFilters>();
  readonly filtersChange = output<Partial<TaskFilters>>();
  readonly newTask = output<void>();

  readonly statusTabs: StatusTab[] = [
    { label: 'All', value: 'all' },
    { label: 'To Do', value: 'todo' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Done', value: 'done' },
  ];

  onStatusChange(status: TaskStatus | 'all'): void {
    this.filtersChange.emit({ status });
  }

  onPriorityChange(priority: TaskPriority | 'all'): void {
    this.filtersChange.emit({ priority });
  }
}
