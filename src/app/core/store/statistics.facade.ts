import { Injectable, inject } from '@angular/core';
import { StatisticsApiService } from '../services/statistics-api.service';
import { StatisticsStore } from '../store/statistics.store';

@Injectable({ providedIn: 'root' })
export class StatisticsFacade {
  private readonly api = inject(StatisticsApiService);
  private readonly store = inject(StatisticsStore);

  readonly statistics = this.store.statistics;
  readonly loading = this.store.loading;

  loadStatistics(): void {
    this.store.setLoading(true);
    this.api.getStatistics().subscribe({
      next: (res) => this.store.setStatistics(res.statistics, res.lastUpdated),
      error: (err) => this.store.setError(err.message),
    });
  }
}
