import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentActionRowComponent } from './document-action-row.component';
import { ActionGate, DocumentRuntimeState } from './document-action-row.types';

describe('DocumentActionRowComponent', () => {
  let fixture: ComponentFixture<DocumentActionRowComponent>;
  let component: DocumentActionRowComponent;

  const ulbGates: ActionGate[] = [
    { docKey: null, scope: 'document', role: 'ULB', action: 'upload', statusIds: [1, 2, 4, 6] },
  ];

  const pendingDoc: DocumentRuntimeState = {
    docKey: 'auditors-report',
    required: true,
    hasFile: false,
    processingStatus: 'NOT_STARTED',
    latestDecision: null,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentActionRowComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentActionRowComponent);
    component = fixture.componentInstance;
  });

  function setInputs(
    role: 'ULB' | 'STATE' | 'MOHUA',
    sectionStatusId: number,
    gates: ActionGate[],
    doc: DocumentRuntimeState,
    readOnly = false,
  ) {
    fixture.componentRef.setInput('role', role);
    fixture.componentRef.setInput('sectionStatusId', sectionStatusId);
    fixture.componentRef.setInput('gates', gates);
    fixture.componentRef.setInput('doc', doc);
    fixture.componentRef.setInput('readOnly', readOnly);
    fixture.detectChanges();
  }

  it('renders one button per resolved action', () => {
    setInputs('ULB', 2, ulbGates, pendingDoc);

    const buttons = fixture.nativeElement.querySelectorAll('button.doc-action-btn');
    expect(buttons.length).toBe(1);
    expect(buttons[0].textContent).toContain('Upload');
  });

  it('renders no buttons when no action resolves', () => {
    setInputs('ULB', 3, ulbGates, pendingDoc);

    expect(fixture.nativeElement.querySelectorAll('button.doc-action-btn').length).toBe(0);
  });

  it('emits actionClicked with the action and docKey when an enabled button is clicked', () => {
    setInputs('ULB', 2, ulbGates, pendingDoc);
    const emitted: Array<{ action: string; docKey: string }> = [];
    component.actionClicked.subscribe((e) => emitted.push(e));

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button.doc-action-btn');
    button.click();

    expect(emitted).toEqual([{ action: 'upload', docKey: 'auditors-report' }]);
  });

  it('does not emit when a disabled button is clicked', () => {
    const stateGates: ActionGate[] = [
      { docKey: null, scope: 'document', role: 'STATE', action: 'approve', statusIds: [3] },
      { docKey: null, scope: 'document', role: 'STATE', action: 'return', statusIds: [3] },
    ];
    const passedNotOcrPassedDoc: DocumentRuntimeState = {
      docKey: 'auditors-report',
      required: true,
      hasFile: true,
      processingStatus: 'PROCESSING',
      latestDecision: null,
    };
    setInputs('STATE', 3, stateGates, passedNotOcrPassedDoc);

    const emitted: unknown[] = [];
    component.actionClicked.subscribe((e) => emitted.push(e));

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button.doc-action-btn--approve');
    expect(button.disabled).toBe(true);
    button.click();

    expect(emitted).toEqual([]);
  });

  it('forces every action disabled when readOnly is true, even if the doc-state logic would enable it', () => {
    setInputs('ULB', 2, ulbGates, pendingDoc, true);

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button.doc-action-btn--upload');
    expect(button.disabled).toBe(true);
  });
});
