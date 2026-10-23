import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';

import { UtilityService } from './utility.service';

describe('UtilityService', () => {
  let service: UtilityService;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      providers: [UtilityService, { provide: MatSnackBar, useValue: snackBarSpy }],
    });

    service = TestBed.inject(UtilityService);
  });

  describe('triggerSnackbar', () => {
    it('auto-dismisses after 3s by default', () => {
      service.triggerSnackbar('Saved.');

      expect(snackBarSpy.open).toHaveBeenCalledWith(
        'Saved.',
        'Close',
        jasmine.objectContaining({ duration: 3000, panelClass: ['snackbar-success'] }),
      );
    });

    it('auto-dismisses after 3s when an explicit className is passed but no options', () => {
      service.triggerSnackbar('Failed.', 'snackbar-danger');

      expect(snackBarSpy.open).toHaveBeenCalledWith(
        'Failed.',
        'Close',
        jasmine.objectContaining({ duration: 3000, panelClass: ['snackbar-danger'] }),
      );
    });

    it('disables auto-dismiss when persistent is true', () => {
      service.triggerSnackbar('One or more rows have already been approved.', 'snackbar-danger', {
        persistent: true,
      });

      expect(snackBarSpy.open).toHaveBeenCalledWith(
        'One or more rows have already been approved.',
        'Close',
        jasmine.objectContaining({ duration: 0, panelClass: ['snackbar-danger'] }),
      );
    });

    it('auto-dismisses after 3s when persistent is explicitly false', () => {
      service.triggerSnackbar('Saved.', 'snackbar-success', { persistent: false });

      expect(snackBarSpy.open).toHaveBeenCalledWith('Saved.', 'Close', jasmine.objectContaining({ duration: 3000 }));
    });
  });
});
