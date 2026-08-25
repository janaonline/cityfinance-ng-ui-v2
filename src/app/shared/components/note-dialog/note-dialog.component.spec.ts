import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoteDialogComponent, NoteDialogData } from './note-dialog.component';

describe('NoteDialogComponent', () => {
  let fixture: ComponentFixture<NoteDialogComponent>;
  let component: NoteDialogComponent;
  let dialogRef: jasmine.SpyObj<MatDialogRef<NoteDialogComponent, string | undefined>>;

  function setup(data: NoteDialogData): void {
    dialogRef = jasmine.createSpyObj<MatDialogRef<NoteDialogComponent, string | undefined>>('MatDialogRef', [
      'close',
    ]);

    TestBed.configureTestingModule({
      imports: [NoteDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    });

    fixture = TestBed.createComponent(NoteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('required-only (no length bounds): a single character is enough to confirm', () => {
    setup({ required: true });

    component.noteControl.setValue('x');

    expect(component.noteControl.valid).toBe(true);
  });

  it('with minLength/maxLength: a note shorter than minLength is invalid', () => {
    setup({ required: true, minLength: 10, maxLength: 200 });

    component.noteControl.setValue('too short');

    expect(component.noteControl.valid).toBe(false);
  });

  it('with minLength/maxLength: whitespace padding does not count toward the minimum (trimmed check)', () => {
    setup({ required: true, minLength: 10, maxLength: 200 });

    component.noteControl.setValue('x         '); // 1 real char + 9 spaces = raw length 10, trimmed length 1
    expect(component.noteControl.valid).toBe(false);
  });

  it('with minLength/maxLength: a note longer than maxLength is invalid', () => {
    setup({ required: true, minLength: 10, maxLength: 20 });

    component.noteControl.setValue('this note is way too long for the configured maximum');

    expect(component.noteControl.valid).toBe(false);
  });

  it('with minLength/maxLength: a note within bounds is valid', () => {
    setup({ required: true, minLength: 10, maxLength: 200 });

    component.noteControl.setValue('a valid enough note');

    expect(component.noteControl.valid).toBe(true);
  });

  it('close() trims the note before resolving the dialog', () => {
    setup({});

    component.close('  hello  ');

    expect(dialogRef.close).toHaveBeenCalledWith('hello');
  });
});
