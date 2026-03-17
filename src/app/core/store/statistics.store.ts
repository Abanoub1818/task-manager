import { Injectable, computed, signal } from '@angular/core';
import { Statistic } from '../models/task.model';

interface StatisticsState {
  statistics: Statistic[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

@Injectable({ providedIn: 'root' })
export class StatisticsStore {
  private readonly _state = signal<StatisticsState>({
    statistics: [],
    loading: false,
    error: null,
    lastUpdated: null,
  });

  readonly statistics = computed(() => this._state().statistics);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);
  readonly lastUpdated = computed(() => this._state().lastUpdated);

  setLoading(loading: boolean): void {
    this._state.update((s) => ({ ...s, loading }));
  }

  setStatistics(statistics: Statistic[], lastUpdated: string): void {
    this._state.update((s) => ({ ...s, statistics, lastUpdated, loading: false, error: null }));
  }

  setError(error: string): void {
    this._state.update((s) => ({ ...s, error, loading: false }));
  }
}
