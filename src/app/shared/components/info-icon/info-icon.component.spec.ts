import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { InfoIconComponent, WHOLE_NUMBER_INFO_TEXT } from './info-icon.component';

describe('InfoIconComponent', () => {
  let fixture: ComponentFixture<InfoIconComponent>;
  let component: InfoIconComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoIconComponent);
    component = fixture.componentInstance;
  });

  it('defaults to the whole-number info text', () => {
    fixture.detectChanges();
    expect(component.text).toBe(WHOLE_NUMBER_INFO_TEXT);
  });

  it('renders an info icon with the text as its tooltip/aria-label', () => {
    fixture.detectChanges();
    const icon = fixture.debugElement.query(By.css('i.bi-info-circle'));
    expect(icon).toBeTruthy();
    expect(icon.attributes['aria-label']).toBe(WHOLE_NUMBER_INFO_TEXT);
  });

  it('accepts a custom text override', () => {
    component.text = 'Custom note.';
    fixture.detectChanges();
    const icon = fixture.debugElement.query(By.css('i.bi-info-circle'));
    expect(icon.attributes['aria-label']).toBe('Custom note.');
  });
});
