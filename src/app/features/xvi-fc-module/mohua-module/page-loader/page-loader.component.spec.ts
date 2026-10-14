import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MohuaPageLoaderComponent } from './page-loader.component';

describe('MohuaPageLoaderComponent', () => {
  const create = (label?: string) => {
    TestBed.configureTestingModule({ imports: [MohuaPageLoaderComponent], providers: [provideNoopAnimations()] });
    const fixture = TestBed.createComponent(MohuaPageLoaderComponent);
    if (label) fixture.componentRef.setInput('label', label);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

  it('shows a spinner and announces what is loading', () => {
    const element = create('Loading the overview');

    expect(element.querySelector('mat-progress-spinner')).not.toBeNull();
    expect(element.querySelector('[role="status"]')?.textContent).toContain('Loading the overview');
    expect(element.querySelector('mat-progress-spinner')?.getAttribute('aria-label')).toBe('Loading the overview');
  });

  it('has a generic label by default', () => {
    expect(create().querySelector('[role="status"]')?.textContent).toContain('Loading');
  });
});
