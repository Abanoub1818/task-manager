import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TaskApiService } from './task-api.service';
import { Task, TasksResponse } from '../models/task.model';
import { environment } from '../../../environments/environment';

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

describe('TaskApiService', () => {
  let service: TaskApiService;
  let http: HttpTestingController;
  const base = `${environment.apiUrl}/tasks`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TaskApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TaskApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getTasks sends GET to /tasks', () => {
    const response: TasksResponse = {
      tasks: [makeTask()],
      meta: { totalCount: 1, lastUpdated: '2025-01-01' },
    };
    service.getTasks().subscribe((res) => expect(res).toEqual(response));
    // retry(2) means up to 3 attempts; flush the first one successfully
    http.expectOne(base).flush(response);
  });

  it('getTask sends GET to /tasks/:id', () => {
    const task = makeTask();
    service.getTask('1').subscribe((res) => expect(res).toEqual(task));
    http.expectOne(`${base}/1`).flush(task);
  });

  it('createTask sends POST with timestamps', () => {
    const task = makeTask();
    service.createTask(task).subscribe((res) => expect(res.id).toBe('1'));
    const req = http.expectOne(base);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.createdAt).toBeTruthy();
    req.flush(task);
  });

  it('updateTask sends PATCH to /tasks/:id', () => {
    const task = makeTask({ title: 'Updated' });
    service.updateTask('1', { title: 'Updated' }).subscribe((res) => expect(res).toEqual(task));
    const req = http.expectOne(`${base}/1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body.updatedAt).toBeTruthy();
    req.flush(task);
  });

  it('deleteTask sends DELETE to /tasks/:id', () => {
    service.deleteTask('1').subscribe();
    const req = http.expectOne(`${base}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getTasks maps HTTP error to Error', () => {
    let caught = false;
    service.getTasks().subscribe({
      error: (e) => {
        caught = true;
        expect(e).toBeInstanceOf(Error);
      },
    });
    // flush all retry attempts
    http.expectOne(base).flush(null, { status: 500, statusText: 'Server Error' });
    http.expectOne(base).flush(null, { status: 500, statusText: 'Server Error' });
    http.expectOne(base).flush(null, { status: 500, statusText: 'Server Error' });
    expect(caught).toBe(true);
  });
});
