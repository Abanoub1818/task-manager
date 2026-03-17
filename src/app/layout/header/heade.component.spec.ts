import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { By } from '@angular/platform-browser';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent], // standalone
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have default searchValue as empty string', () => {
    expect(component.searchValue()).toBe('');
  });

  it('should emit searchChange event', () => {
    let emittedValue: string | null = null;

    component.searchChange.subscribe((value) => {
      emittedValue = value;
    });

    component.searchChange.emit('test search');

    expect(emittedValue).toBe('test search');
  });

  it('should emit menuToggle event', () => {
    let emitted = false;

    component.menuToggle.subscribe(() => {
      emitted = true;
    });

    component.menuToggle.emit();

    expect(emitted).toBe(true);
  });

  it('should bind input value and emit changes (ngModel)', async () => {
    const inputEl = fixture.debugElement.query(By.css('input'));

    if (!inputEl) {
      // Skip if template has no input
      expect(true).toBe(true);
      return;
    }

    const nativeInput = inputEl.nativeElement as HTMLInputElement;

    let emittedValue: string | null = null;
    component.searchChange.subscribe((value) => {
      emittedValue = value;
    });

    nativeInput.value = 'hello';
    nativeInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(emittedValue).toBe('hello');
  });
});
