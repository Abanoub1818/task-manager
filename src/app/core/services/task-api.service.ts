import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, retry, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Task, TasksResponse } from '../models/task.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TaskApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tasks`;

  /** Returns full { tasks, meta } wrapper — served by our custom GET /tasks route */
  getTasks(): Observable<TasksResponse> {
    return this.http.get<TasksResponse>(this.baseUrl).pipe(
      retry(2),
      catchError((err) => throwError(() => new Error(err.message))),
    );
  }

  getTask(id: string): Observable<Task> {
    return this.http
      .get<Task>(`${this.baseUrl}/${id}`)
      .pipe(catchError((err) => throwError(() => new Error(err.message))));
  }

  createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Observable<Task> {
    const now = new Date().toISOString();
    return this.http
      .post<Task>(this.baseUrl, { ...task, createdAt: now, updatedAt: now })
      .pipe(catchError((err) => throwError(() => new Error(err.message))));
  }

  updateTask(id: string, changes: Partial<Task>): Observable<Task> {
    return this.http
      .patch<Task>(`${this.baseUrl}/${id}`, { ...changes, updatedAt: new Date().toISOString() })
      .pipe(catchError((err) => throwError(() => new Error(err.message))));
  }

  deleteTask(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/${id}`)
      .pipe(catchError((err) => throwError(() => new Error(err.message))));
  }
}
