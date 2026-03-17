import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskCardComponent } from './task-card.component';
import { Task } from '../../../core/models/task.model';
import { ConfirmationService } from 'primeng/api';
import { provideZonelessChangeDetection } from '@angular/core';

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: '1',
  title: 'Test Task',
  description: 'desc',
  status: 'todo',
  priority: 'medium',
  dueDate: new Date(Date.now() + 3 * 86_400_000).toISOString(),
  assignee: { id: 'u1', name: 'Alice', avatar: 'A', email: 'a@a.com' },
  tags: ['bug'],
  createdAt: '2025-01-01',
  updatedAt: '2025-01-01',
  ...overrides,
});

describe('TaskCardComponent', () => {
  let fixture: ComponentFixture<TaskCardComponent>;
  let component: TaskCardComponent;
  let confirm: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    confirm = vi.fn();

    await TestBed.configureTestingModule({
      imports: [TaskCardComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ConfirmationService, useValue: { confirm } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('task', makeTask());
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('menuOpen starts as false', () => {
    expect(component.menuOpen()).toBe(false);
  });

  it('toggleMenu flips menuOpen', () => {
    component.toggleMenu(new MouseEvent('click'));
    expect(component.menuOpen()).toBe(true);
    component.toggleMenu(new MouseEvent('click'));
    expect(component.menuOpen()).toBe(false);
  });

  it('closeMenu sets menuOpen to false', () => {
    component.menuOpen.set(true);
    component.closeMenu();
    expect(component.menuOpen()).toBe(false);
  });

  it('onEdit emits the task and closes menu', () => {
    let emitted: Task | undefined;
    component.edit.subscribe((t) => (emitted = t));
    component.menuOpen.set(true);
    component.onEdit();
    expect(emitted).toEqual(component.task());
    expect(component.menuOpen()).toBe(false);
  });

  it('onDeleteClick calls confirmationService.confirm', () => {
    component.onDeleteClick(new MouseEvent('click'));
    expect(confirm).toHaveBeenCalled();
  });

  it('dueInLabel returns "3 days" for task due in 3 days', () => {
    expect(component.dueInLabel()).toBe('3 days');
  });

  it('dueInLabel returns "today" when due date is in the past', () => {
    fixture.componentRef.setInput(
      'task',
      makeTask({ dueDate: new Date(Date.now() - 1000).toISOString() }),
    );
    expect(component.dueInLabel()).toBe('today');
  });

  it('dueInLabel returns "1 day" for tomorrow', () => {
    fixture.componentRef.setInput(
      'task',
      makeTask({
        dueDate: new Date(Date.now() + 1 * 86_400_000).toISOString(),
      }),
    );
    expect(component.dueInLabel()).toBe('1 day');
  });

  it('overdueLabel returns correct day count', () => {
    fixture.componentRef.setInput(
      'task',
      makeTask({
        dueDate: new Date(Date.now() - 2 * 86_400_000).toISOString(),
      }),
    );
    expect(component.overdueLabel()).toBe('2 days');
  });

  it('overdueLabel returns "1 day" for exactly 1 day overdue', () => {
    fixture.componentRef.setInput(
      'task',
      makeTask({
        dueDate: new Date(Date.now() - 1.5 * 86_400_000).toISOString(),
      }),
    );
    expect(component.overdueLabel()).toBe('1 day');
  });
});
