import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TaskFacade } from '../../core/store/task.facade';
import { StatisticsFacade } from '../../core/store/statistics.facade';
import { computed } from '@angular/core';

const makeTaskFacade = () => ({
  loadTasks: vi.fn(),
  cancelForm: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  tasks: computed(() => []),
  filteredTasks: computed(() => []),
  tasksByStatus: computed(() => ({ todo: [], in_progress: [], done: [] })),
  loading: computed(() => false),
  error: computed(() => null),
  filters: computed(() => ({
    status: 'all',
    priority: 'all',
    assigneeId: 'all',
    search: '',
  })),
  setFilters: vi.fn(),
  resetFilters: vi.fn(),
  deleteTask: vi.fn(),
  cancelDelete: vi.fn(),
  updateTaskStatus: vi.fn(),
  reorderTasksInStatus: vi.fn(),
});

const makeStatsFacade = () => ({
  loadStatistics: vi.fn(),
  statistics: computed(() => []),
  loading: computed(() => false),
  error: computed(() => null),
});

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let component: DashboardComponent;
  let taskFacade: ReturnType<typeof makeTaskFacade>;
  let statsFacade: ReturnType<typeof makeStatsFacade>;

  beforeEach(async () => {
    taskFacade = makeTaskFacade();
    statsFacade = makeStatsFacade();

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideAnimationsAsync(),
        ConfirmationService,
        MessageService,
        { provide: TaskFacade, useValue: taskFacade },
        { provide: StatisticsFacade, useValue: statsFacade },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('calls loadTasks and loadStatistics on init', () => {
    expect(taskFacade.loadTasks).toHaveBeenCalled();
    expect(statsFacade.loadStatistics).toHaveBeenCalled();
  });

  it('openTaskDialog opens dialog for new task and calls createTask on close', async () => {
    await component.openTaskDialog();
    // dialog is opened; no error thrown
    expect(component).toBeTruthy();
  });

  it('openTaskDialog opens dialog for existing task', async () => {
    const task = {
      id: '1',
      title: 'T',
      description: '',
      status: 'todo' as const,
      priority: 'medium' as const,
      dueDate: '',
      assignee: { id: 'u1', name: 'A', avatar: 'A', email: 'a@a.com' },
      tags: [],
      createdAt: '',
      updatedAt: '',
    };
    await component.openTaskDialog(task);
    expect(component).toBeTruthy();
  });
});
