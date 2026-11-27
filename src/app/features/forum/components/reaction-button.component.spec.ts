import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { ReactionButtonComponent } from './reaction-button.component';

const url = `${environment.api.url2}forum/threads/t1/reactions`;

describe('ReactionButtonComponent', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactionButtonComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function render() {
    const fixture = TestBed.createComponent(ReactionButtonComponent);
    fixture.componentRef.setInput('target', 'thread-like');
    fixture.componentRef.setInput('targetId', 't1');
    fixture.componentRef.setInput('initialCount', 5);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const count = () => el.querySelector('strong')?.textContent?.trim();
    return { fixture, el, count };
  }

  it('shows the click straight away, then the server count', () => {
    const { fixture, el, count } = render();
    el.querySelector('button')!.click();
    fixture.detectChanges();
    expect(count()).toBe('6');
    http.expectOne(url).flush({ success: true, data: { active: true, likeCount: 9 } });
    fixture.detectChanges();
    expect(count()).toBe('9');
  });

  it('after a failure, shows the refreshed count rather than undoing the click from it', () => {
    const { fixture, el, count } = render();
    el.querySelector('button')!.click();
    fixture.detectChanges();
    // A silent page refresh delivers a newer count while the request is still in flight.
    fixture.componentRef.setInput('initialCount', 7);
    fixture.detectChanges();
    http.expectOne(url).flush({ message: 'Oops' }, { status: 503, statusText: 'Unavailable' });
    fixture.detectChanges();
    expect(count()).toBe('7');
    expect(el.querySelector('button')?.getAttribute('aria-pressed')).toBe('false');
  });
});
