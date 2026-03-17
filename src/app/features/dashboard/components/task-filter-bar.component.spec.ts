import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskFilterBarComponent } from './task-filter-bar.component';
import { TaskFilters } from '../../../core/models/task.model';
import { provideZonelessChangeDetection } from '@angular/core';

const defaultFilters: TaskFilters = {
  status: 'all',
  priority: 'all',
  assigneeId: 'all',
  search: '',
};

describe('TaskFilterBarComponent', () => {
  let fixture: ComponentFixture<TaskFilterBarComponent>;
  let component: TaskFilterBarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFilterBarComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFilterBarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('filters', defaultFilters);
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('has 4 status tabs', () => {
    expect(component.statusTabs.length).toBe(4);
  });

  it('onStatusChange emits the selected status', () => {
    let emitted: Partial<TaskFilters> | undefined;
    component.filtersChange.subscribe((f) => (emitted = f));
    component.onStatusChange('done');
    expect(emitted).toEqual({ status: 'done' });
  });

  it('onPriorityChange emits the selected priority', () => {
    let emitted: Partial<TaskFilters> | undefined;
    component.filtersChange.subscribe((f) => (emitted = f));
    component.onPriorityChange('high');
    expect(emitted).toEqual({ priority: 'high' });
  });

  it('newTask output emits when triggered', () => {
    let emitted = false;
    component.newTask.subscribe(() => (emitted = true));
    component.newTask.emit();
    expect(emitted).toBe(true);
  });
});
