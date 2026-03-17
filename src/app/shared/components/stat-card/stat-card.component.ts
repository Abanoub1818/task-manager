import { Component, computed, input } from '@angular/core';
import { Statistic } from '../../../core/models/task.model';
import { NgClass } from '@angular/common';

const ICON_MAP: Record<string, string> = {
  'stat-001': 'pi pi-chart-bar',
  'stat-002': 'pi pi-check-circle',
  'stat-003': 'pi pi-sync',
  'stat-004': 'pi pi-exclamation-triangle',
};

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [NgClass],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
})
export class StatCardComponent {
  readonly stat = input.required<Statistic>();
  readonly iconClass = computed(() => ICON_MAP[this.stat().id] ?? 'pi pi-circle');
}
