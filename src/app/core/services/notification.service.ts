import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly toast = inject(MessageService);

  success(summary: string, detail: string): void {
    this.toast.add({ severity: 'success', summary, detail, life: 3000 });
  }

  error(summary: string, detail: string): void {
    this.toast.add({ severity: 'error', summary, detail, life: 3000 });
  }

  info(summary: string, detail: string): void {
    this.toast.add({ severity: 'info', summary, detail, life: 3000 });
  }
}
