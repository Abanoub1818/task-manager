import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import { MessageService } from 'primeng/api';

describe('NotificationService', () => {
  let service: NotificationService;
  let add: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    add = vi.fn();
    TestBed.configureTestingModule({
      providers: [NotificationService, { provide: MessageService, useValue: { add } }],
    });
    service = TestBed.inject(NotificationService);
  });

  it('success calls add with severity success', () => {
    service.success('Done', 'Task saved');
    expect(add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success', summary: 'Done', detail: 'Task saved' }),
    );
  });

  it('error calls add with severity error', () => {
    service.error('Oops', 'Something failed');
    expect(add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', summary: 'Oops' }),
    );
  });

  it('info calls add with severity info', () => {
    service.info('Note', 'Cancelled');
    expect(add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'info', summary: 'Note' }),
    );
  });
});
