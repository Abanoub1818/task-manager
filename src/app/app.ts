import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { HeaderComponent } from './layout/header/header.component';
import { TaskFacade } from './core/store/task.facade';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-root',
  standalone: true,
  providers: [DialogService],
  imports: [
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    ConfirmDialogModule,
    ToastModule,
    DynamicDialogModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent {
  private readonly facade = inject(TaskFacade);
  private readonly dialogService = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef);
  readonly search = signal('');
  readonly sidebarOpen = signal(false);

  onSearch(value: string): void {
    this.search.set(value);
    this.facade.setFilters({ search: value });
  }

  async onNewTask(): Promise<void> {
    const { TaskFormDialogComponent } =
      await import('./shared/components/task-form-dialog/task-form-dialog.component');
    const ref = this.dialogService.open(TaskFormDialogComponent, {
      header: 'New Task',
      width: '560px',
      modal: true,
      closable: true,
      data: {},
    });
    ref?.onClose.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      if (!result) {
        this.facade.cancelForm();
        return;
      }
      this.facade.createTask(result);
    });
  }
}
