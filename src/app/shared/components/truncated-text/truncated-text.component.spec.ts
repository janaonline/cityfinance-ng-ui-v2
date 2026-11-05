import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TruncatedTextComponent } from './truncated-text.component';

const LONG_TEXT =
  'I understand that this submission may contain information entered or modified by other users. ' +
  'I have reviewed the final submission and confirm that the information being submitted is complete ' +
  'and accurate to the best of my knowledge.';

describe('TruncatedTextComponent', () => {
  let fixture: ComponentFixture<TruncatedTextComponent>;

  function setup(width: string): void {
    fixture = TestBed.createComponent(TruncatedTextComponent);
    fixture.nativeElement.style.display = 'block';
    fixture.nativeElement.style.width = width;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TruncatedTextComponent] }).compileComponents();
  });

  describe('ellipsis mode (default)', () => {
    it('does not show a tooltip for text that fits', () => {
      setup('600px');
      fixture.componentRef.setInput('text', 'Short name');
      fixture.detectChanges();

      expect(fixture.componentInstance.isOverflowing()).toBeFalse();
    });

    it('shows a tooltip when the text overflows a narrow container', () => {
      setup('60px');
      fixture.componentRef.setInput('text', LONG_TEXT);
      fixture.detectChanges();

      expect(fixture.componentInstance.isOverflowing()).toBeTrue();
    });
  });

  describe('clamp mode', () => {
    it('shows no toggle for text that fits within the clamp', () => {
      setup('600px');
      fixture.componentRef.setInput('text', 'Short remark.');
      fixture.componentRef.setInput('mode', 'clamp');
      fixture.detectChanges();

      expect(fixture.componentInstance.isOverflowing()).toBeFalse();
      expect(fixture.debugElement.query(By.css('.truncated-text__toggle'))).toBeNull();
    });

    it('shows a "Show more" toggle for text that overflows the clamp, and expands/collapses on click', () => {
      setup('150px');
      fixture.componentRef.setInput('text', LONG_TEXT);
      fixture.componentRef.setInput('mode', 'clamp');
      fixture.componentRef.setInput('lines', 2);
      fixture.detectChanges();

      expect(fixture.componentInstance.isOverflowing()).toBeTrue();
      let toggle = fixture.debugElement.query(By.css('.truncated-text__toggle'));
      expect(toggle.nativeElement.textContent.trim()).toBe('Show more');
      expect(fixture.componentInstance.expanded()).toBeFalse();

      toggle.nativeElement.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.expanded()).toBeTrue();
      toggle = fixture.debugElement.query(By.css('.truncated-text__toggle'));
      expect(toggle.nativeElement.textContent.trim()).toBe('Show less');

      toggle.nativeElement.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.expanded()).toBeFalse();
    });

    it('applies the lines input as the clamp CSS variable', () => {
      setup('150px');
      fixture.componentRef.setInput('text', LONG_TEXT);
      fixture.componentRef.setInput('mode', 'clamp');
      fixture.componentRef.setInput('lines', 5);
      fixture.detectChanges();

      const span = fixture.debugElement.query(By.css('.truncated-text__clamp'));
      expect(span.nativeElement.style.getPropertyValue('--truncated-text-lines')).toBe('5');
    });
  });
});
