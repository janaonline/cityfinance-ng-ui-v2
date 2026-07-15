import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { DynamicFormService } from '../../../../../../shared/dynamic-form/dynamic-form.service';
import { FcUnspentUlbOption } from '../../fc-unspent-declaration.models';
import {
  createFcUnspentUlbRowGroup,
  FcUnspentUlbRowGroup,
  UnspentUlbTableComponent,
} from './unspent-ulb-table.component';

const ULB_OPTIONS: FcUnspentUlbOption[] = [
  {
    ulbId: '66a000000000000000000001',
    censusCode: '800123',
    sbCode: null,
    ulbName: 'Sample Municipal Corporation',
    allocationAmount: 20,
  },
  {
    ulbId: '66a000000000000000000002',
    censusCode: null,
    sbCode: 'SB-0142',
    ulbName: 'Sample Municipal Council',
    allocationAmount: 8,
  },
  {
    ulbId: '66a000000000000000000003',
    censusCode: '800456',
    sbCode: null,
    ulbName: 'Sample Nagar Panchayat',
    allocationAmount: 12.5,
  },
];

describe('UnspentUlbTableComponent', () => {
  let component: UnspentUlbTableComponent;
  let fixture: ComponentFixture<UnspentUlbTableComponent>;
  let dynamicService: DynamicFormService;
  let rows: FormArray<FcUnspentUlbRowGroup>;

  function setupWithRows(rowGroups: FcUnspentUlbRowGroup[], canEdit = true): void {
    rows = new FormArray<FcUnspentUlbRowGroup>(rowGroups);
    fixture.componentRef.setInput('rows', rows);
    fixture.componentRef.setInput('ulbOptions', ULB_OPTIONS);
    fixture.componentRef.setInput('canEdit', canEdit);
    fixture.componentRef.setInput('applicableFcLabel', '14th');
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnspentUlbTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UnspentUlbTableComponent);
    component = fixture.componentInstance;
    dynamicService = TestBed.inject(DynamicFormService);
  });

  it('should create', () => {
    setupWithRows([createFcUnspentUlbRowGroup(dynamicService, true)]);
    expect(component).toBeTruthy();
  });

  it('renders hydrated rows', () => {
    setupWithRows([
      createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: ULB_OPTIONS[0].ulbId, unspentAmount: 1.5 }),
      createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: ULB_OPTIONS[1].ulbId, unspentAmount: 1.2 }),
    ]);

    const rowEls = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(rowEls.length).toBe(2);
  });

  it('displays Census Code when present', () => {
    setupWithRows([
      createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: ULB_OPTIONS[0].ulbId, unspentAmount: 1 }),
    ]);
    const codeCell = fixture.debugElement.queryAll(By.css('tbody tr td'))[2];
    expect(codeCell.nativeElement.textContent).toContain('800123');
  });

  it('displays SB Code as fallback when Census Code is absent', () => {
    setupWithRows([
      createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: ULB_OPTIONS[1].ulbId, unspentAmount: 1 }),
    ]);
    const codeCell = fixture.debugElement.queryAll(By.css('tbody tr td'))[2];
    expect(codeCell.nativeElement.textContent).toContain('SB-0142');
  });

  it('adds a row', () => {
    setupWithRows([createFcUnspentUlbRowGroup(dynamicService, true)]);
    const addButton = fixture.debugElement.query(By.css('button[aria-label="Add ULB"]'));
    addButton.nativeElement.click();
    expect(rows.length).toBe(2);
  });

  it('removes the requested row', () => {
    setupWithRows([
      createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: ULB_OPTIONS[0].ulbId, unspentAmount: 1 }),
      createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: ULB_OPTIONS[1].ulbId, unspentAmount: 1 }),
    ]);

    component.removeRow(0);
    fixture.detectChanges();

    expect(rows.length).toBe(1);
    expect(rows.at(0).controls.ulbId.value).toBe(ULB_OPTIONS[1].ulbId);
  });

  it('disables duplicate ULB choices already picked by other rows', () => {
    setupWithRows([
      createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: ULB_OPTIONS[0].ulbId, unspentAmount: 1 }),
      createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: null, unspentAmount: null }),
    ]);

    expect(component.takenUlbIdsByRowIndex()[1].has(ULB_OPTIONS[0].ulbId)).toBe(true);

    // options: [0] placeholder, [1] ULB_OPTIONS[0], [2] ULB_OPTIONS[1], [3] ULB_OPTIONS[2]
    const secondRowOptions = fixture.debugElement.queryAll(By.css('tbody tr'))[1].queryAll(By.css('option'));
    expect(secondRowOptions[1].nativeElement.disabled).toBe(true);
    expect(secondRowOptions[2].nativeElement.disabled).toBe(false);
    expect(secondRowOptions[3].nativeElement.disabled).toBe(false);
  });

  it("keeps the current row's own selected option enabled", () => {
    setupWithRows([
      createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: ULB_OPTIONS[0].ulbId, unspentAmount: 1 }),
      createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: ULB_OPTIONS[1].ulbId, unspentAmount: 1 }),
    ]);

    expect(component.takenUlbIdsByRowIndex()[0].has(ULB_OPTIONS[0].ulbId)).toBe(false);
    expect(component.takenUlbIdsByRowIndex()[1].has(ULB_OPTIONS[1].ulbId)).toBe(false);
  });

  it('calculates and displays an eligible percentage', () => {
    setupWithRows([
      createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: ULB_OPTIONS[0].ulbId, unspentAmount: 1.5 }),
    ]);

    expect(component.rowViewModels()[0].allocationPerc).toBeCloseTo(7.5, 5);
    expect(component.rowViewModels()[0].eligible).toBe(true);

    const badge = fixture.debugElement.query(By.css('tbody tr .badge'));
    expect(badge.nativeElement.classList).toContain('text-bg-success');
  });

  it('calculates and displays an ineligible percentage', () => {
    setupWithRows([
      createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: ULB_OPTIONS[1].ulbId, unspentAmount: 1.2 }),
    ]);

    expect(component.rowViewModels()[0].allocationPerc).toBeCloseTo(15, 5);
    expect(component.rowViewModels()[0].eligible).toBe(false);

    const badge = fixture.debugElement.query(By.css('tbody tr .badge'));
    expect(badge.nativeElement.classList).toContain('text-bg-danger');
  });

  it('shows — when allocation or entered amount is unavailable', () => {
    setupWithRows([createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: null, unspentAmount: null })]);

    expect(component.rowViewModels()[0].allocationPerc).toBeNull();
    expect(component.rowViewModels()[0].eligible).toBeNull();

    const cells = fixture.debugElement.queryAll(By.css('tbody tr td'));
    expect(cells[5].nativeElement.textContent).toContain('—');
    expect(cells[6].nativeElement.textContent).toContain('—');
  });

  it('disables add/remove actions when canEdit is false', () => {
    setupWithRows(
      [createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: ULB_OPTIONS[0].ulbId, unspentAmount: 1 })],
      false,
    );

    const addButton = fixture.debugElement.query(By.css('button[aria-label="Add ULB"]'));
    const removeButton = fixture.debugElement.query(By.css('button.unspent-row-btn'));

    expect(addButton.nativeElement.disabled).toBe(true);
    expect(removeButton.nativeElement.disabled).toBe(true);
  });
});
