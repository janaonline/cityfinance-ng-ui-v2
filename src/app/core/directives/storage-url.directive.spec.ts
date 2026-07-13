import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { S3Service } from '../services/s3.service';
import { SignedUrlDirective } from './storage-url.directive';

@Component({
  standalone: true,
  imports: [SignedUrlDirective],
  template: `<a [appSignedUrl]="url" target="_blank">view</a>`,
})
class HostComponent {
  url = '';
}

describe('SignedUrlDirective', () => {
  const signedUrl = 'https://signed.example.com/bucket/file?sig=abc';

  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let s3Service: jasmine.SpyObj<S3Service>;
  let windowOpenSpy: jasmine.Spy;

  beforeEach(async () => {
    s3Service = jasmine.createSpyObj<S3Service>('S3Service', ['getSignedUrl']);
    s3Service.getSignedUrl.and.returnValue(of(signedUrl));

    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: S3Service, useValue: s3Service }],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    windowOpenSpy = spyOn(window, 'open');
  });

  function anchor(): HTMLAnchorElement {
    return fixture.debugElement.query(By.css('a')).nativeElement as HTMLAnchorElement;
  }

  function directive(): SignedUrlDirective {
    return fixture.debugElement.query(By.directive(SignedUrlDirective)).injector.get(SignedUrlDirective);
  }

  /** Exposes the private download trigger for spying — real navigation would unload the Karma page. */
  function downloadable(): { startDownload(url: string): void } {
    return directive() as unknown as { startDownload(url: string): void };
  }

  /** Suppresses real anchor navigation in the test browser without affecting the directive's listener. */
  function suppressNativeNavigation(): void {
    anchor().addEventListener('click', (event) => event.preventDefault());
  }

  function click(): void {
    anchor().dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
  }

  it('downloads download-only files (xlsx) in place without opening a tab', () => {
    host.url = 'xvi-fc/state/example/devolution-data.xlsx';
    fixture.detectChanges();
    const startDownloadSpy = spyOn(downloadable(), 'startDownload');

    click();

    expect(windowOpenSpy).not.toHaveBeenCalled();
    expect(s3Service.getSignedUrl).toHaveBeenCalledWith('xvi-fc/state/example/devolution-data.xlsx');
    expect(startDownloadSpy).toHaveBeenCalledWith(signedUrl);
    // No cached href: subsequent clicks repeat the same no-tab download flow.
    expect(anchor().getAttribute('href')).toBeNull();
  });

  it('resolves query-string paths by their real extension', () => {
    host.url = 'xvi-fc/state/example/report.csv?version=2';
    fixture.detectChanges();
    const startDownloadSpy = spyOn(downloadable(), 'startDownload');

    click();

    expect(windowOpenSpy).not.toHaveBeenCalled();
    expect(startDownloadSpy).toHaveBeenCalled();
  });

  it('does not download when signing fails for a download-only file', () => {
    s3Service.getSignedUrl.and.returnValue(of(''));
    host.url = 'xvi-fc/state/example/devolution-data.xlsx';
    fixture.detectChanges();
    const startDownloadSpy = spyOn(downloadable(), 'startDownload');

    click();

    expect(startDownloadSpy).not.toHaveBeenCalled();
  });

  it('opens renderable files (pdf) through the popup flow', () => {
    const popup = { close: jasmine.createSpy('close'), location: { href: '' } };
    windowOpenSpy.and.returnValue(popup as unknown as Window);
    host.url = 'xvi-fc/state/example/sfc-report.pdf';
    fixture.detectChanges();

    click();

    expect(windowOpenSpy).toHaveBeenCalledWith('about:blank', '_blank');
    expect(popup.location.href).toBe(signedUrl);
    // Resolved URL is cached on the anchor for subsequent native clicks.
    expect(anchor().getAttribute('href')).toBe(signedUrl);
  });

  it('binds absolute https inputs directly to href and does not intercept the click', () => {
    host.url = 'https://signed.example.com/direct.pdf';
    fixture.detectChanges();
    suppressNativeNavigation();

    expect(anchor().getAttribute('href')).toBe('https://signed.example.com/direct.pdf');

    click();

    expect(s3Service.getSignedUrl).not.toHaveBeenCalled();
    expect(windowOpenSpy).not.toHaveBeenCalled();
  });

  it('prevents the click and fetches nothing when the input is empty', () => {
    host.url = '';
    fixture.detectChanges();

    click();

    expect(s3Service.getSignedUrl).not.toHaveBeenCalled();
    expect(windowOpenSpy).not.toHaveBeenCalled();
    expect(anchor().getAttribute('href')).toBeNull();
  });
});
