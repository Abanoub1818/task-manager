import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { StatisticsFacade } from './statistics.facade';
import { StatisticsApiService } from '../services/statistics-api.service';
import { StatisticsStore } from './statistics.store';
import { StatisticsResponse } from '../models/task.model';

const mockResponse: StatisticsResponse = {
  statistics: [
    {
      id: 'stat-001',
      title: 'Total',
      icon: 'pi pi-chart-bar',
      value: 10,
      change: '+5%',
      changeLabel: 'vs last week',
      changeType: 'positive',
      color: 'blue',
    },
  ],
  lastUpdated: '2025-01-01',
};

describe('StatisticsFacade', () => {
  let facade: StatisticsFacade;
  let getStatistics: ReturnType<typeof vi.fn>;
  let setLoading: ReturnType<typeof vi.fn>;
  let setStatistics: ReturnType<typeof vi.fn>;
  let setError: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getStatistics = vi.fn();
    setLoading = vi.fn();
    setStatistics = vi.fn();
    setError = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        StatisticsFacade,
        { provide: StatisticsApiService, useValue: { getStatistics } },
        {
          provide: StatisticsStore,
          useValue: {
            setLoading,
            setStatistics,
            setError,
            statistics: signal([]),
            loading: signal(false),
          },
        },
      ],
    });
    facade = TestBed.inject(StatisticsFacade);
  });

  it('calls API and sets statistics on success', () => {
    getStatistics.mockReturnValue(of(mockResponse));
    facade.loadStatistics();
    expect(setLoading).toHaveBeenCalledWith(true);
    expect(setStatistics).toHaveBeenCalledWith(mockResponse.statistics, mockResponse.lastUpdated);
  });

  it('calls setError on API failure', () => {
    getStatistics.mockReturnValue(throwError(() => new Error('network')));
    facade.loadStatistics();
    expect(setError).toHaveBeenCalledWith('network');
  });
});
