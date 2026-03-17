import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskFormDialogComponent } from './task-form-dialog.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Task } from '../../../core/models/task.model';
import { MOCK_USERS } from '../../../core/services/mock-users';

const makeTask = (): Task => ({
  id: '1',
  title: 'Existing Task',
  description: 'desc',
  status: 'in_progress',
  priority: 'high',
  dueDate: '2025-12-01',
  assignee: MOCK_USERS[0],
  tags: ['bug', 'urgent'],
  createdAt: '',
  updatedAt: '',
});

describe('TaskFormDialogComponent', () => {
  let fixture: ComponentFixture<TaskFormDialogComponent>;
  let component: TaskFormDialogComponent;
  let refClose: ReturnType<typeof vi.fn>;

  const setup = async (task?: Task) => {
    refClose = vi.fn();
    await TestBed.configureTestingModule({
      imports: [TaskFormDialogComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideAnimationsAsync(),
        { provide: DynamicDialogRef, useValue: { close: refClose } },
        { provide: DynamicDialogConfig, useValue: { data: { task } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  it('creates for new task', async () => {
    await setup();
    expect(component).toBeTruthy();
    expect(component.isEdit).toBe(false);
  }, 15000);

  it('creates for existing task and patches form', async () => {
    await setup(makeTask());
    expect(component.isEdit).toBe(true);
    expect(component.form.value.title).toBe('Existing Task');
    expect(component.form.value.priority).toBe('high');
    expect(component.form.value.tags).toBe('bug, urgent');
  });

  it('cancel calls ref.close with no args', async () => {
    await setup();
    component.cancel();
    expect(refClose).toHaveBeenCalledWith();
  });

  it('submit does nothing when form is invalid', async () => {
    await setup();
    component.form.patchValue({ title: '' });
    component.submit();
    expect(refClose).not.toHaveBeenCalled();
  });

  it('submit closes with payload when form is valid', async () => {
    await setup();
    component.form.patchValue({
      title: 'New Task',
      description: 'some desc',
      priority: 'low',
      status: 'todo',
      dueDate: '2025-12-01',
      assigneeId: MOCK_USERS[0].id,
      tags: 'tag1, tag2',
    });
    component.submit();
    expect(refClose).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New Task',
        priority: 'low',
        tags: ['tag1', 'tag2'],
        assignee: MOCK_USERS[0],
      }),
    );
  });

  it('submit handles empty tags', async () => {
    await setup();
    component.form.patchValue({
      title: 'Task',
      priority: 'medium',
      status: 'todo',
      dueDate: '2025-12-01',
      assigneeId: MOCK_USERS[0].id,
      tags: '',
    });
    component.submit();
    expect(refClose).toHaveBeenCalledWith(expect.objectContaining({ tags: [] }));
  });
});
