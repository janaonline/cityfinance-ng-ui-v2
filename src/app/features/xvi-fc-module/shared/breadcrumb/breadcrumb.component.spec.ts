import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { XvifcBreadcrumbComponent } from './breadcrumb.component';

describe('XvifcBreadcrumbComponent', () => {
  let fixture: ComponentFixture<XvifcBreadcrumbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, XvifcBreadcrumbComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(XvifcBreadcrumbComponent);
  });

  it('renders every crumb but the last as a link, and the last as plain current-page text', () => {
    fixture.componentRef.setInput('links', [
      { label: 'Claim Letter', routerLink: ['/xvifc', 'year-1', 'claim-letter'] },
      { label: 'New Claim Letter' },
    ]);
    fixture.detectChanges();

    const anchors = fixture.debugElement.queryAll(By.css('a'));
    expect(anchors.length).toBe(1);
    expect(anchors[0].nativeElement.textContent.trim()).toBe('Claim Letter');

    const current = fixture.debugElement.query(By.css('[aria-current="page"]'));
    expect(current.nativeElement.textContent.trim()).toBe('New Claim Letter');
  });

  it('renders the trailing crumb as plain text even if it were given a routerLink', () => {
    fixture.componentRef.setInput('links', [
      { label: 'Claim Letter', routerLink: ['/xvifc', 'year-1', 'claim-letter'] },
      { label: 'Batch #2', routerLink: ['/xvifc', 'year-1', 'claim-letter', 'id-2'] },
    ]);
    fixture.detectChanges();

    const anchors = fixture.debugElement.queryAll(By.css('a'));
    expect(anchors.length).toBe(1);
    expect(fixture.debugElement.query(By.css('[aria-current="page"]')).nativeElement.textContent.trim()).toBe(
      'Batch #2',
    );
  });
});
