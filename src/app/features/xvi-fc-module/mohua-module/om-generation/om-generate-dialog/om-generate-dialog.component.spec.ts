import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { OmGenerateDialogComponent } from './om-generate-dialog.component';

describe('OmGenerateDialogComponent', () => {
  let dialogRef: jasmine.SpyObj<MatDialogRef<OmGenerateDialogComponent>>;

  const create = (): HTMLElement => {
    const fixture = TestBed.createComponent(OmGenerateDialogComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };
  const button = (host: HTMLElement, text: string) =>
    Array.from(host.querySelectorAll('button')).find((b) => b.textContent?.includes(text)) as HTMLButtonElement;

  beforeEach(async () => {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    await TestBed.configureTestingModule({
      imports: [OmGenerateDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { counts: { noActionRecorded: 3, excluded: 0, included: 3 } } },
      ],
    }).compileComponents();
  });

  it('shows the city counts the OM covers', () => {
    const text = create().textContent ?? '';

    expect(text).toContain('Office Memorandum for 3 cities');
    expect(text).toContain('Cities rejected / excluded from this OM');
  });

  it('closes with generate, preview, or nothing on cancel', () => {
    const host = create();

    button(host, 'Proceed and generate OM').click();
    button(host, 'Preview OM first').click();
    button(host, 'Cancel').click();

    expect(dialogRef.close.calls.allArgs()).toEqual([['generate'], ['preview'], [undefined]]);
  });
});
