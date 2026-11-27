import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { ReportButtonComponent } from './report-button.component';

const url = `${environment.api.url2}forum/threads/t1/report`;

describe('ReportButtonComponent', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReportButtonComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function openAndSend(): { el: HTMLElement; detect: () => void } {
    const fixture = TestBed.createComponent(ReportButtonComponent);
    fixture.componentRef.setInput('target', 'thread');
    fixture.componentRef.setInput('targetId', 't1');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    el.querySelector<HTMLButtonElement>('button')!.click();
    fixture.detectChanges();
    const radios = el.querySelectorAll<HTMLInputElement>('input[type=radio]');
    expect(radios.length).toBe(4);
    radios[0].click();
    fixture.detectChanges();
    el.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    return { el, detect: () => fixture.detectChanges() };
  }

  it('sends the chosen reason and shows "Reported"', () => {
    const { el, detect } = openAndSend();
    const req = http.expectOne(url);
    expect(req.request.body).toEqual({ reason: 'off-topic' });
    req.flush({ success: true, data: { reported: true } });
    detect();
    expect(el.textContent).toContain('Reported');
  });

  it('treats "already reported" (409) as done: no form, no error', () => {
    const { el, detect } = openAndSend();
    http
      .expectOne(url)
      .flush(
        { message: 'You have already reported this post.' },
        { status: 409, statusText: 'Conflict' },
      );
    detect();
    expect(el.querySelector('form')).toBeNull();
    expect(el.querySelector('.field-error')).toBeNull();
    expect(el.textContent).toContain('Reported');
  });

  it('shows the server message for other errors', () => {
    const { el, detect } = openAndSend();
    http
      .expectOne(url)
      .flush({ message: 'Thread not found.' }, { status: 404, statusText: 'Not Found' });
    detect();
    expect(el.querySelector('.field-error')?.textContent).toContain('Thread not found.');
  });
});
