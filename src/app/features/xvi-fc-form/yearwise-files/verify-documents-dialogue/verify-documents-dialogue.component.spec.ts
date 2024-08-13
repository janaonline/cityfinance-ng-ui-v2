import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyDocumentsDialogueComponent } from './verify-documents-dialogue.component';

xdescribe('VerifyDocumentsDialogueComponent', () => {
  let component: VerifyDocumentsDialogueComponent;
  let fixture: ComponentFixture<VerifyDocumentsDialogueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyDocumentsDialogueComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VerifyDocumentsDialogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
