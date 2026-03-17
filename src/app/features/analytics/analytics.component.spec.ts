import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnalyticsComponent } from './analytics.component';
import { TaskFacade } from '../../core/store/task.facade';

describe('AnalyticsComponent', () => {
  let component: AnalyticsComponent;
  let fixture: ComponentFixture<AnalyticsComponent>;
  let mockFacade: any;

  beforeEach(async () => {
    mockFacade = {
      loadTasks: vi.fn(),
      tasks: vi.fn(),
      tasksByStatus: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AnalyticsComponent],
      providers: [{ provide: TaskFacade, useValue: mockFacade }],
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyticsComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadTasks on init', () => {
    mockFacade.tasks.mockReturnValue([]);
    mockFacade.tasksByStatus.mockReturnValue({
      todo: [],
      in_progress: [],
      done: [],
    });

    component.ngOnInit();

    expect(mockFacade.loadTasks).toHaveBeenCalled();
  });

  it('should compute statusChartData correctly', () => {
    mockFacade.tasksByStatus.mockReturnValue({
      todo: [{}, {}],
      in_progress: [{}],
      done: [{}, {}, {}],
    });

    const result = component.statusChartData();

    expect(result.labels).toEqual(['To Do', 'In Progress', 'Done']);
    expect(result.datasets[0].data).toEqual([2, 1, 3]);
  });

  it('should compute priorityChartData correctly', () => {
    mockFacade.tasks.mockReturnValue([
      { priority: 'high' },
      { priority: 'high' },
      { priority: 'medium' },
      { priority: 'low' },
      { priority: 'low' },
      { priority: 'low' },
    ]);

    const result = component.priorityChartData();

    expect(result.labels).toEqual(['High', 'Medium', 'Low']);
    expect(result.datasets[0].data).toEqual([2, 1, 3]);
  });

  it('should handle empty data', () => {
    mockFacade.tasks.mockReturnValue([]);
    mockFacade.tasksByStatus.mockReturnValue({
      todo: [],
      in_progress: [],
      done: [],
    });

    const status = component.statusChartData();
    const priority = component.priorityChartData();

    expect(status.datasets[0].data).toEqual([0, 0, 0]);
    expect(priority.datasets[0].data).toEqual([0, 0, 0]);
  });
});
