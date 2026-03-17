import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatCardComponent } from './stat-card.component';
import { Statistic } from '../../../core/models/task.model';
import { provideZonelessChangeDetection } from '@angular/core';

const makeStat = (overrides: Partial<Statistic> = {}): Statistic => ({
  id: 'stat-001',
  title: 'Total Tasks',
  icon: 'pi pi-chart-bar',
  value: 42,
  change: '+5%',
  changeLabel: 'vs last week',
  changeType: 'positive',
  color: 'blue',
  ...overrides,
});

describe('StatCardComponent', () => {
  let fixture: ComponentFixture<StatCardComponent>;
  let component: StatCardComponent;

  const render = (stat: Statistic) => {
    fixture = TestBed.createComponent(StatCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('stat', stat);
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StatCardComponent],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('creates the component', () => {
    render(makeStat());
    expect(component).toBeTruthy();
  });

  it('resolves known icon from ICON_MAP', () => {
    render(makeStat({ id: 'stat-001' }));
    expect(component.iconClass()).toBe('pi pi-chart-bar');
  });

  it('resolves stat-002 icon', () => {
    render(makeStat({ id: 'stat-002' }));
    expect(component.iconClass()).toBe('pi pi-check-circle');
  });

  it('falls back to pi pi-circle for unknown id', () => {
    render(makeStat({ id: 'unknown' }));
    expect(component.iconClass()).toBe('pi pi-circle');
  });

  it('renders stat value in the template', () => {
    render(makeStat({ value: 99 }));
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('99');
  });

  it('renders stat title in the template', () => {
    render(makeStat({ title: 'Total Tasks' }));
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Total Tasks');
  });
});
