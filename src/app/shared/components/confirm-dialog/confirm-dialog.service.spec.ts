import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';
import { ConfirmDialogService } from './confirm-dialog.service';

function buildDialogRef(result: boolean | undefined): MatDialogRef<ConfirmDialogComponent, boolean> {
  return { afterClosed: () => of(result) } as unknown as MatDialogRef<ConfirmDialogComponent, boolean>;
}

function setup(result: boolean | undefined): {
  service: ConfirmDialogService;
  dialog: jasmine.SpyObj<MatDialog>;
} {
  const dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
  dialog.open.and.returnValue(buildDialogRef(result) as any);

  TestBed.configureTestingModule({
    providers: [ConfirmDialogService, { provide: MatDialog, useValue: dialog }],
  });

  return { service: TestBed.inject(ConfirmDialogService), dialog };
}

describe('ConfirmDialogService', () => {
  describe('dialog open options', () => {
    it('opens dialog with empty data object when called without arguments', () => {
      const { service, dialog } = setup(true);

      service.confirm().subscribe();

      expect(dialog.open).toHaveBeenCalledOnceWith(ConfirmDialogComponent, jasmine.objectContaining({ data: {} }));
    });

    it('opens dialog with the provided custom data', () => {
      const { service, dialog } = setup(true);
      const customData: ConfirmDialogData = { title: 'Custom title', message: 'Custom message' };

      service.confirm(customData).subscribe();

      expect(dialog.open).toHaveBeenCalledOnceWith(
        ConfirmDialogComponent,
        jasmine.objectContaining({ data: customData }),
      );
    });

    it('merges provided config into the dialog open options', () => {
      const { service, dialog } = setup(true);

      service.confirm(undefined, { panelClass: 'xvifc-theme', maxWidth: '500px' }).subscribe();

      expect(dialog.open).toHaveBeenCalledOnceWith(
        ConfirmDialogComponent,
        jasmine.objectContaining({ panelClass: 'xvifc-theme', maxWidth: '500px' }),
      );
    });

    it('explicit data always takes precedence over config.data', () => {
      const { service, dialog } = setup(true);
      const explicitData: ConfirmDialogData = { title: 'Explicit' };

      service.confirm(explicitData, { data: { title: 'From config' } } as any).subscribe();

      expect(dialog.open).toHaveBeenCalledOnceWith(
        ConfirmDialogComponent,
        jasmine.objectContaining({ data: explicitData }),
      );
    });
  });

  describe('result mapping', () => {
    it('emits true when the dialog closes with confirmed result', (done) => {
      const { service } = setup(true);

      service.confirm().subscribe((result) => {
        expect(result).toBeTrue();
        done();
      });
    });

    it('emits false when the dialog is dismissed (undefined result)', (done) => {
      const { service } = setup(undefined);

      service.confirm().subscribe((result) => {
        expect(result).toBeFalse();
        done();
      });
    });
  });
});
