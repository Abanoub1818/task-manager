import { Component, HostListener, inject, input, output, signal } from '@angular/core';
import { Task } from '../../../core/models/task.model';
import { NgClass, DatePipe, UpperCasePipe } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [NgClass, DatePipe, UpperCasePipe, TooltipModule],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
})
export class TaskCardComponent {
  private readonly confirmationService = inject(ConfirmationService);

  readonly task = input.required<Task>();
  readonly edit = output<Task>();
  readonly delete = output<string>();
  readonly cancelDelete = output<void>();
  readonly menuOpen = signal(false);

  toggleMenu(e: Event): void {
    e.stopPropagation();
    this.menuOpen.update((v) => !v);
  }
  onEdit(): void {
    this.menuOpen.set(false);
    this.edit.emit(this.task());
  }

  onDeleteClick(e: Event): void {
    e.stopPropagation();
    this.menuOpen.set(false);
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${this.task().title}"?`,
      header: 'Delete Task',
      icon: 'pi pi-trash',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.delete.emit(this.task().id),
      reject: () => this.cancelDelete.emit(),
    });
  }

  @HostListener('document:click')
  closeMenu(): void {
    this.menuOpen.set(false);
  }

  overdueLabel(): string {
    const diff = Math.floor((Date.now() - new Date(this.task().dueDate).getTime()) / 86_400_000);
    return diff === 1 ? '1 day' : `${diff} days`;
  }

  dueInLabel(): string {
    const diff = Math.ceil((new Date(this.task().dueDate).getTime() - Date.now()) / 86_400_000);
    if (diff <= 0) return 'today';
    if (diff === 1) return '1 day';
    if (diff === 7) return '1 week';
    return `${diff} days`;
  }
}
