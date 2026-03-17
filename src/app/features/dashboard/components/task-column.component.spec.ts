import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskColumnComponent } from './task-column.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ConfirmationService } from 'primeng/api';
import { Task, TaskStatus } from '../../../core/models/task.model';

const makeTask = (id: string, status: TaskStatus = 'todo'): Task => ({
  id,
  title: `Task ${id}`,
  description: '',
  status,
  priority: 'medium',
  dueDate: new Date(Date.now() + 86_400_000).toISOString(),
  assignee: { id: 'u1', name: 'Alice', avatar: 'A', email: 'a@a.com' },
  tags: [],
  createdAt: '',
  updatedAt: '',
});

describe('TaskColumnComponent', () => {
  let fixture: ComponentFixture<TaskColumnComponent>;
  let component: TaskColumnComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskColumnComponent],
      providers: [provideZonelessChangeDetection(), provideAnimationsAsync(), ConfirmationService],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskColumnComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'To Do');
    fixture.componentRef.setInput('status', 'todo');
    fixture.componentRef.setInput('tasks', [makeTask('1'), makeTask('2')]);
    fixture.detectChanges();
  }, 15000);

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('onDragStart sets dragged task', () => {
    const task = makeTask('1');
    component.onDragStart(task);
    expect(component.isDragging(task)).toBe(true);
  });

  it('onDragEnd clears drag state', () => {
    const task = makeTask('1');
    component.onDragStart(task);
    component.onDragEnd();
    expect(component.isDragging(task)).toBe(false);
    expect(component.dragOverIndex()).toBe(-1);
    expect(component.isDragOver()).toBe(false);
  });

  const makeDragEvent = (props: Record<string, unknown> = {}): DragEvent => {
    const e = new MouseEvent('dragover') as unknown as DragEvent;
    Object.defineProperty(e, 'preventDefault', { value: vi.fn() });
    Object.defineProperty(e, 'stopPropagation', { value: vi.fn() });
    for (const [k, v] of Object.entries(props)) {
      Object.defineProperty(e, k, { value: v });
    }
    return e;
  };

  it('onColumnDragOver sets isDragOver and dragOverIndex to tasks length when -1', () => {
    component.onColumnDragOver(makeDragEvent());
    expect(component.isDragOver()).toBe(true);
    expect(component.dragOverIndex()).toBe(2);
  });

  it('onColumnDragLeave clears state when relatedTarget is outside', () => {
    component.isDragOver.set(true);
    component.dragOverIndex.set(1);
    const colEl = document.createElement('div');
    component.onColumnDragLeave(
      makeDragEvent({ relatedTarget: document.createElement('div') }),
      colEl,
    );
    expect(component.isDragOver()).toBe(false);
    expect(component.dragOverIndex()).toBe(-1);
  });

  it('onDrop does nothing when no dragged task', () => {
    component.onDragEnd();
    const spy = vi.fn();
    component.statusChange.subscribe(spy);
    component.onDrop(makeDragEvent());
    expect(spy).not.toHaveBeenCalled();
  });

  it('onDrop emits statusChange when dropping to different column', () => {
    const task = makeTask('1', 'todo');
    component.onDragStart(task);
    fixture.componentRef.setInput('status', 'in_progress');
    let emitted: { id: string; status: TaskStatus } | undefined;
    component.statusChange.subscribe((v) => (emitted = v));
    component.onDrop(makeDragEvent());
    expect(emitted).toEqual({ id: '1', status: 'in_progress' });
  });

  it('onDrop emits reorder when dropping within same column', () => {
    const task = makeTask('1', 'todo');
    component.onDragStart(task);
    component.dragOverIndex.set(1);
    let emitted: { status: TaskStatus; tasks: Task[] } | undefined;
    component.reorder.subscribe((v) => (emitted = v));
    component.onDrop(makeDragEvent());
    expect(emitted?.status).toBe('todo');
  });

  it('onCardDragOver sets dragOverIndex based on mouse position', () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'getBoundingClientRect', { value: () => ({ top: 0, height: 100 }) });
    component.onCardDragOver(makeDragEvent({ currentTarget: el, clientY: 80 }), 0);
    expect(component.isDragOver()).toBe(true);
  });
});
