import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SignedUrlDirective } from '../../../../../core/directives/storage-url.directive';
import { IUlbMaster } from '../../../../../core/models/ulb-master';
import { UlbReviewDialogComponent, UlbReviewDialogData } from './ulb-review-dialog.component';

describe('UlbReviewDialogComponent', () => {
  let fixture: ComponentFixture<UlbReviewDialogComponent>;
  let component: UlbReviewDialogComponent;

  function createUlb(overrides: Partial<IUlbMaster> = {}): IUlbMaster {
    return {
      _id: 'ulb-1',
      code: 'UB001',
      name: 'Test ULB',
      ulbType: 'municipality',
      state: 'state-1',
      isActive: true,
      isPublish: false,
      approval: { status: 'PENDING' },
      ...overrides,
    } as IUlbMaster;
  }

  async function setup(data: UlbReviewDialogData): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [UlbReviewDialogComponent, NoopAnimationsModule, HttpClientTestingModule],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UlbReviewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('renders the gazette file link from the canonical path', async () => {
    await setup({
      ulb: createUlb({
        gazetteNotificationFile: {
          originalName: 'gazette.pdf',
          path: '/state/gazette.pdf',
          mimeType: 'application/pdf',
          sizeKb: 12,
          pageCount: 2,
        },
      }),
    });

    expect(component.gazetteFile?.path).toBe('/state/gazette.pdf');
    const link = fixture.debugElement.query(By.directive(SignedUrlDirective));
    expect(link).toBeTruthy();
    // Raw storage path: the signed-url directive resolves it on click, so no direct href is rendered.
    expect(link.injector.get(SignedUrlDirective).appSignedUrl()).toBe('/state/gazette.pdf');
    expect((link.nativeElement as HTMLAnchorElement).getAttribute('href')).toBeNull();
  });

  it('links an absolute https gazette URL directly without signing', async () => {
    await setup({
      ulb: createUlb({
        gazetteNotificationFile: {
          originalName: 'gazette.pdf',
          path: 'https://signed.example.com/state/gazette.pdf',
          mimeType: 'application/pdf',
          sizeKb: 12,
          pageCount: 2,
        },
      }),
    });

    const link = (fixture.nativeElement as HTMLElement).querySelector('a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('https://signed.example.com/state/gazette.pdf');
  });

  it('normalizes a pre-canonical gazette record (fileName/fileUrl) for display', async () => {
    await setup({
      ulb: createUlb({
        gazetteNotificationFile: {
          fileName: 'old-gazette.pdf',
          fileUrl: '/state/old-gazette.pdf',
          fileSize: 1024,
        } as unknown as IUlbMaster['gazetteNotificationFile'],
      }),
    });

    expect(component.gazetteFile).toEqual({
      originalName: 'old-gazette.pdf',
      path: '/state/old-gazette.pdf',
      mimeType: '',
      sizeKb: 1,
      pageCount: null,
    });
    expect((fixture.nativeElement as HTMLElement).querySelector('a')).toBeTruthy();
  });

  it('hides the gazette file block when no file is present', async () => {
    await setup({ ulb: createUlb({ gazetteNotificationFile: null }) });

    expect(component.gazetteFile).toBeNull();
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Gazette Notification File');
  });
});
