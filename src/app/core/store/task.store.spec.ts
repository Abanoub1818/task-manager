import { TestBed } from '@angular/core/testing';
import { TaskStore } from './task.store';
import { Task } from '../models/task.model';

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

describe('TaskStore', () => {
  let store: TaskStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(TaskStore);
  });

  it('has correct initial state', () => {
    expect(store.tasks()).toEqual([]);
    expect(store.loaded()).toBe(false);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('setLoading updates loading flag', () => {
    store.setLoading(true);
    expect(store.loading()).toBe(true);
    store.setLoading(false);
    expect(store.loading()).toBe(false);
  });

  it('setError sets error and clears loading', () => {
    store.setLoading(true);
    store.setError('oops');
    expect(store.error()).toBe('oops');
    expect(store.loading()).toBe(false);
  });

  it('setTasks populates tasks and marks loaded', () => {
    const tasks = [makeTask()];
    store.setTasks(tasks);
    expect(store.tasks()).toEqual(tasks);
    expect(store.loaded()).toBe(true);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('addTask appends a task', () => {
    store.setTasks([makeTask({ id: '1' })]);
    store.addTask(makeTask({ id: '2', title: 'New' }));
    expect(store.tasks().length).toBe(2);
    expect(store.tasks()[1].id).toBe('2');
  });

  it('updateTask replaces the matching task', () => {
    store.setTasks([makeTask({ id: '1', title: 'Old' })]);
    store.updateTask(makeTask({ id: '1', title: 'Updated' }));
    expect(store.tasks()[0].title).toBe('Updated');
  });

  it('deleteTask removes the task by id', () => {
    store.setTasks([makeTask({ id: '1' }), makeTask({ id: '2' })]);
    store.deleteTask('1');
    expect(store.tasks().length).toBe(1);
    expect(store.tasks()[0].id).toBe('2');
  });

  it('updateTaskStatus changes status and updatedAt', () => {
    store.setTasks([makeTask({ id: '1', status: 'todo' })]);
    store.updateTaskStatus('1', 'done');
    expect(store.tasks()[0].status).toBe('done');
  });

  it('reorderTasksInStatus replaces tasks for that status only', () => {
    const t1 = makeTask({ id: '1', status: 'todo' });
    const t2 = makeTask({ id: '2', status: 'todo' });
    const t3 = makeTask({ id: '3', status: 'done' });
    store.setTasks([t1, t2, t3]);
    store.reorderTasksInStatus('todo', [t2, t1]);
    const todos = store.tasks().filter((t) => t.status === 'todo');
    expect(todos[0].id).toBe('2');
    expect(todos[1].id).toBe('1');
    expect(store.tasks().find((t) => t.id === '3')).toBeTruthy();
  });

  it('setFilters merges partial filters', () => {
    store.setFilters({ status: 'done' });
    expect(store.filters().status).toBe('done');
    expect(store.filters().priority).toBe('all');
  });

  it('resetFilters restores defaults', () => {
    store.setFilters({ status: 'done', priority: 'high' });
    store.resetFilters();
    expect(store.filters().status).toBe('all');
    expect(store.filters().priority).toBe('all');
    expect(store.filters().search).toBe('');
  });

  describe('filteredTasks', () => {
    beforeEach(() => {
      store.setTasks([
        makeTask({ id: '1', status: 'todo', priority: 'high', title: 'Alpha' }),
        makeTask({ id: '2', status: 'done', priority: 'low', title: 'Beta' }),
        makeTask({
          id: '3',
          status: 'in_progress',
          priority: 'medium',
          title: 'Gamma',
          assignee: { id: 'u2', name: 'Bob', avatar: 'B', email: 'b@b.com' },
        }),
      ]);
    });

    it('returns all tasks when filters are default', () => {
      expect(store.filteredTasks().length).toBe(3);
    });

    it('filters by status', () => {
      store.setFilters({ status: 'todo' });
      expect(store.filteredTasks().length).toBe(1);
      expect(store.filteredTasks()[0].id).toBe('1');
    });

    it('filters by priority', () => {
      store.setFilters({ priority: 'low' });
      expect(store.filteredTasks().length).toBe(1);
      expect(store.filteredTasks()[0].id).toBe('2');
    });

    it('filters by assigneeId', () => {
      store.setFilters({ assigneeId: 'u2' });
      expect(store.filteredTasks().length).toBe(1);
      expect(store.filteredTasks()[0].id).toBe('3');
    });

    it('filters by search on title', () => {
      store.setFilters({ search: 'alpha' });
      expect(store.filteredTasks().length).toBe(1);
      expect(store.filteredTasks()[0].id).toBe('1');
    });

    it('filters by search on description', () => {
      store.setFilters({ search: 'desc' });
      expect(store.filteredTasks().length).toBe(3);
    });
  });

  describe('tasksByStatus', () => {
    it('groups tasks by status', () => {
      store.setTasks([
        makeTask({ id: '1', status: 'todo' }),
        makeTask({ id: '2', status: 'in_progress' }),
        makeTask({ id: '3', status: 'done' }),
        makeTask({ id: '4', status: 'done' }),
      ]);
      const grouped = store.tasksByStatus();
      expect(grouped.todo.length).toBe(1);
      expect(grouped.in_progress.length).toBe(1);
      expect(grouped.done.length).toBe(2);
    });
  });
});
