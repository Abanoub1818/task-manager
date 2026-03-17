import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, retry, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { StatisticsResponse } from '../models/task.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StatisticsApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/statistics`;

  /** Returns full { statistics, lastUpdated } wrapper — served by our custom GET /statistics route */
  getStatistics(): Observable<StatisticsResponse> {
    return this.http.get<StatisticsResponse>(this.url).pipe(
      retry(2),
      catchError((err) => throwError(() => new Error(err.message))),
    );
  }
}
