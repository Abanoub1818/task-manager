import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { TaskFacade } from './task.facade';
import { TaskApiService } from '../services/task-api.service';
import { TaskStore } from './task.store';
import { NotificationService } from '../services/notification.service';
import { Task, TasksResponse } from '../models/task.model';

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: '1',
  title: 'Test',
  description: 'desc',
  status: 'todo',
  priority: 'medium',
  dueDate: '2025-12-31',
  assignee: { id: 'u1', name: 'Alice', avatar: 'A', email: 'a@a.com' },
  tags: [],
  createdAt: '2025-01-01',
  updatedAt: '2025-01-01',
  ...overrides,
});

describe('TaskFacade', () => {
  let facade: TaskFacade;
  let getTasks: ReturnType<typeof vi.fn>;
  let createTask: ReturnType<typeof vi.fn>;
  let updateTask: ReturnType<typeof vi.fn>;
  let deleteTask: ReturnType<typeof vi.fn>;
  let setLoading: ReturnType<typeof vi.fn>;
  let setError: ReturnType<typeof vi.fn>;
  let setTasks: ReturnType<typeof vi.fn>;
  let addTask: ReturnType<typeof vi.fn>;
  let storeUpdateTask: ReturnType<typeof vi.fn>;
  let storeDeleteTask: ReturnType<typeof vi.fn>;
  let updateTaskStatus: ReturnType<typeof vi.fn>;
  let reorderTasksInStatus: ReturnType<typeof vi.fn>;
  let setFilters: ReturnType<typeof vi.fn>;
  let resetFilters: ReturnType<typeof vi.fn>;
  let loaded: ReturnType<typeof vi.fn>;
  let tasks: ReturnType<typeof vi.fn>;
  let notifySuccess: ReturnType<typeof vi.fn>;
  let notifyError: ReturnType<typeof vi.fn>;
  let notifyInfo: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getTasks = vi.fn();
    createTask = vi.fn();
    updateTask = vi.fn();
    deleteTask = vi.fn();
    setLoading = vi.fn();
    setError = vi.fn();
    setTasks = vi.fn();
    addTask = vi.fn();
    storeUpdateTask = vi.fn();
    storeDeleteTask = vi.fn();
    updateTaskStatus = vi.fn();
    reorderTasksInStatus = vi.fn();
    setFilters = vi.fn();
    resetFilters = vi.fn();
    loaded = vi.fn().mockReturnValue(false);
    tasks = vi.fn().mockReturnValue([]);
    notifySuccess = vi.fn();
    notifyError = vi.fn();
    notifyInfo = vi.fn();

    const mockApi = {
      getTasks,
      createTask,
      updateTask,
      deleteTask,
    };

    const mockStore = {
      setLoading,
      setError,
      setTasks,
      addTask,
      updateTask: storeUpdateTask,
      deleteTask: storeDeleteTask,
      updateTaskStatus,
      reorderTasksInStatus,
      setFilters,
      resetFilters,
      loaded,
      tasks,
      filteredTasks: signal([]),
      tasksByStatus: signal({ todo: [], in_progress: [], done: [] }),
      loading: signal(false),
      error: signal(null),
      filters: signal({ status: 'all', priority: 'all', assigneeId: 'all', search: '' }),
    };

    const mockNotify = {
      success: notifySuccess,
      error: notifyError,
      info: notifyInfo,
    };

    TestBed.configureTestingModule({
      providers: [
        TaskFacade,
        { provide: TaskApiService, useValue: mockApi },
        { provide: TaskStore, useValue: mockStore },
        { provide: NotificationService, useValue: mockNotify },
      ],
    });
    facade = TestBed.inject(TaskFacade);
  });

  describe('loadTasks', () => {
    it('skips API call when store is already loaded', () => {
      loaded.mockReturnValue(true);
      facade.loadTasks();
      expect(getTasks).not.toHaveBeenCalled();
    });

    it('calls API and sets tasks on success', () => {
      const response: TasksResponse = {
        tasks: [makeTask()],
        meta: { totalCount: 1, lastUpdated: '2025-01-01' },
      };
      getTasks.mockReturnValue(of(response));
      facade.loadTasks();
      expect(setLoading).toHaveBeenCalledWith(true);
      expect(setTasks).toHaveBeenCalledWith(response.tasks);
    });

    it('calls setError on API failure', () => {
      getTasks.mockReturnValue(throwError(() => new Error('fail')));
      facade.loadTasks();
      expect(setError).toHaveBeenCalledWith('fail');
    });
  });

  describe('createTask', () => {
    it('adds task and shows success notification', () => {
      const task = makeTask();
      createTask.mockReturnValue(of(task));
      facade.createTask(task);
      expect(addTask).toHaveBeenCalledWith(task);
      expect(notifySuccess).toHaveBeenCalled();
    });

    it('shows error notification on failure', () => {
      createTask.mockReturnValue(throwError(() => new Error('err')));
      facade.createTask(makeTask());
      expect(notifyError).toHaveBeenCalled();
    });
  });

  describe('updateTask', () => {
    it('updates store and shows success notification', () => {
      const updated = makeTask({ title: 'Updated' });
      updateTask.mockReturnValue(of(updated));
      facade.updateTask('1', { title: 'Updated' });
      expect(storeUpdateTask).toHaveBeenCalledWith(updated);
      expect(notifySuccess).toHaveBeenCalled();
    });

    it('shows error notification on failure', () => {
      updateTask.mockReturnValue(throwError(() => new Error('err')));
      facade.updateTask('1', {});
      expect(notifyError).toHaveBeenCalled();
    });
  });

  describe('deleteTask', () => {
    it('deletes from store and shows success notification', () => {
      tasks.mockReturnValue([makeTask({ id: '1', title: 'My Task' })]);
      deleteTask.mockReturnValue(of(undefined));
      facade.deleteTask('1');
      expect(storeDeleteTask).toHaveBeenCalledWith('1');
      expect(notifySuccess).toHaveBeenCalled();
    });

    it('shows error notification on failure', () => {
      tasks.mockReturnValue([]);
      deleteTask.mockReturnValue(throwError(() => new Error('err')));
      facade.deleteTask('1');
      expect(notifyError).toHaveBeenCalled();
    });
  });

  it('cancelDelete shows info notification', () => {
    facade.cancelDelete();
    expect(notifyInfo).toHaveBeenCalled();
  });

  it('cancelForm shows info notification', () => {
    facade.cancelForm();
    expect(notifyInfo).toHaveBeenCalled();
  });

  it('updateTaskStatus updates store and calls API', () => {
    updateTask.mockReturnValue(of(makeTask({ status: 'done' })));
    facade.updateTaskStatus('1', 'done');
    expect(updateTaskStatus).toHaveBeenCalledWith('1', 'done');
    expect(updateTask).toHaveBeenCalledWith('1', { status: 'done' });
  });

  it('reorderTasksInStatus delegates to store', () => {
    const taskList = [makeTask()];
    facade.reorderTasksInStatus('todo', taskList);
    expect(reorderTasksInStatus).toHaveBeenCalledWith('todo', taskList);
  });

  it('setFilters delegates to store', () => {
    facade.setFilters({ status: 'done' });
    expect(setFilters).toHaveBeenCalledWith({ status: 'done' });
  });

  it('resetFilters delegates to store', () => {
    facade.resetFilters();
    expect(resetFilters).toHaveBeenCalled();
  });
});
