import { TestBed } from '@angular/core/testing';
import { StatisticsStore } from './statistics.store';
import { Statistic } from '../models/task.model';

const makeStat = (overrides: Partial<Statistic> = {}): Statistic => ({
  id: 'stat-001',
  title: 'Total',
  icon: 'pi pi-chart-bar',
  value: 10,
  change: '+5%',
  changeLabel: 'vs last week',
  changeType: 'positive',
  color: 'blue',
  ...overrides,
});

describe('StatisticsStore', () => {
  let store: StatisticsStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(StatisticsStore);
  });

  it('has correct initial state', () => {
    expect(store.statistics()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.lastUpdated()).toBeNull();
  });

  it('setLoading updates loading flag', () => {
    store.setLoading(true);
    expect(store.loading()).toBe(true);
  });

  it('setStatistics populates data and clears loading/error', () => {
    store.setLoading(true);
    const stats = [makeStat()];
    store.setStatistics(stats, '2025-01-01');
    expect(store.statistics()).toEqual(stats);
    expect(store.lastUpdated()).toBe('2025-01-01');
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('setError stores error and clears loading', () => {
    store.setLoading(true);
    store.setError('network error');
    expect(store.error()).toBe('network error');
    expect(store.loading()).toBe(false);
  });
});
