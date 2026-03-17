import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

describe('SidebarComponent', () => {
  let fixture: ComponentFixture<SidebarComponent>;
  let component: SidebarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('has 6 nav items', () => {
    expect(component.navItems.length).toBe(6);
  });

  it('open defaults to false', () => {
    expect(component.open()).toBe(false);
  });

  it('open input can be set to true', () => {
    fixture.componentRef.setInput('open', true);
    expect(component.open()).toBe(true);
  });

  it('newTask output emits', () => {
    let emitted = false;
    component.newTask.subscribe(() => (emitted = true));
    component.newTask.emit();
    expect(emitted).toBe(true);
  });

  it('close output emits', () => {
    let emitted = false;
    component.close.subscribe(() => (emitted = true));
    component.close.emit();
    expect(emitted).toBe(true);
  });
});
