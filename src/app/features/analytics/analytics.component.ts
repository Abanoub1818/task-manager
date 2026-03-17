import { Component, computed, inject, OnInit } from '@angular/core';
import { TaskFacade } from '../../core/store/task.facade';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
})
export class AnalyticsComponent implements OnInit {
  private readonly facade = inject(TaskFacade);

  readonly chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    plugins: { legend: { position: 'bottom' } },
  };

  readonly statusChartData = computed<ChartData>(() => {
    const { todo, in_progress, done } = this.facade.tasksByStatus();
    return {
      labels: ['To Do', 'In Progress', 'Done'],
      datasets: [
        {
          data: [todo.length, in_progress.length, done.length],
          backgroundColor: ['#1976d2', '#ff6f00', '#388e3c'],
        },
      ],
    };
  });

  readonly priorityChartData = computed<ChartData>(() => {
    const tasks = this.facade.tasks();
    return {
      labels: ['High', 'Medium', 'Low'],
      datasets: [
        {
          label: 'Tasks',
          data: [
            tasks.filter((t) => t.priority === 'high').length,
            tasks.filter((t) => t.priority === 'medium').length,
            tasks.filter((t) => t.priority === 'low').length,
          ],
          backgroundColor: ['#d32f2f', '#f57c00', '#388e3c'],
        },
      ],
    };
  });

  ngOnInit(): void {
    this.facade.loadTasks();
  }
}
