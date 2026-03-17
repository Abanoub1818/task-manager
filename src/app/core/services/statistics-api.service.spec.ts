import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { StatisticsApiService } from './statistics-api.service';
import { StatisticsResponse } from '../models/task.model';
import { environment } from '../../../environments/environment';

describe('StatisticsApiService', () => {
  let service: StatisticsApiService;
  let http: HttpTestingController;
  const url = `${environment.apiUrl}/statistics`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StatisticsApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StatisticsApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getStatistics sends GET to /statistics', () => {
    const response: StatisticsResponse = { statistics: [], lastUpdated: '2025-01-01' };
    service.getStatistics().subscribe((res) => expect(res).toEqual(response));
    http.expectOne(url).flush(response);
  });

  it('getStatistics maps HTTP error to Error', () => {
    let caught = false;
    service.getStatistics().subscribe({
      error: (e) => {
        caught = true;
        expect(e).toBeInstanceOf(Error);
      },
    });
    http.expectOne(url).flush(null, { status: 500, statusText: 'Server Error' });
    http.expectOne(url).flush(null, { status: 500, statusText: 'Server Error' });
    http.expectOne(url).flush(null, { status: 500, statusText: 'Server Error' });
    expect(caught).toBe(true);
  });
});
