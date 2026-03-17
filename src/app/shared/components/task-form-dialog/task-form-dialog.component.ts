import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Task, TaskPriority, TaskStatus } from '../../../core/models/task.model';
import { MOCK_USERS } from '../../../core/services/mock-users';

export interface TaskDialogData {
  task?: Task;
}

@Component({
  selector: 'app-task-form-dialog',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './task-form-dialog.component.html',
  styleUrl: './task-form-dialog.component.scss',
})
export class TaskFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ref = inject(DynamicDialogRef);
  readonly config = inject(DynamicDialogConfig);

  readonly users = MOCK_USERS;
  readonly isEdit = !!this.config.data?.task;

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    priority: ['medium' as TaskPriority, Validators.required],
    status: ['todo' as TaskStatus, Validators.required],
    dueDate: ['', Validators.required],
    assigneeId: ['', Validators.required],
    tags: [''],
  });

  ngOnInit(): void {
    if (this.config.data?.task) {
      const t: Task = this.config.data.task;
      this.form.patchValue({
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: t.status,
        dueDate: t.dueDate,
        assigneeId: t.assignee.id,
        tags: t.tags.join(', '),
      });
    }
  }

  cancel(): void {
    this.ref.close();
  }

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const assignee = this.users.find((u) => u.id === v.assigneeId)!;
    this.ref.close({
      title: v.title!,
      description: v.description ?? '',
      priority: v.priority as TaskPriority,
      status: v.status as TaskStatus,
      dueDate: v.dueDate!,
      assignee,
      tags: v.tags
        ? v.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    });
  }
}
