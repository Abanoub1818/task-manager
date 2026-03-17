import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { TaskFacade } from '../../core/store/task.facade';
import { StatisticsFacade } from '../../core/store/statistics.facade';
import { TaskColumnComponent } from './components/task-column.component';
import { TaskFilterBarComponent } from './components/task-filter-bar.component';
import { Task } from '../../core/models/task.model';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  providers: [DialogService],
  imports: [
    StatCardComponent,
    TaskColumnComponent,
    TaskFilterBarComponent,
    DynamicDialogModule,
    SkeletonModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  readonly taskFacade = inject(TaskFacade);
  readonly statsFacade = inject(StatisticsFacade);
  private readonly dialogService = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.taskFacade.loadTasks();
    this.statsFacade.loadStatistics();
  }

  async openTaskDialog(task?: Task): Promise<void> {
    const { TaskFormDialogComponent } =
      await import('../../shared/components/task-form-dialog/task-form-dialog.component');
    const ref = this.dialogService.open(TaskFormDialogComponent, {
      header: task ? 'Edit Task' : 'New Task',
      width: '560px',
      modal: true,
      closable: true,
      data: { task },
    });
    ref?.onClose.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      if (!result) {
        this.taskFacade.cancelForm();
        return;
      }
      if (task) {
        this.taskFacade.updateTask(task.id, result);
      } else {
        this.taskFacade.createTask(result);
      }
    });
  }
}
