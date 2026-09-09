import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  AMOUNT_DISPLAY_OVERRIDE_STORAGE_KEY,
  AmountDisplayModeService,
} from '../../../../core/services/amount-display-mode.service';
import { OverviewCardComponent, OverviewData } from './overview-card.component';

describe('OverviewCardComponent', () => {
  let component: OverviewCardComponent;
  let fixture: ComponentFixture<OverviewCardComponent>;
  let amountDisplay: AmountDisplayModeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} }], imports: [HttpClientTestingModule, RouterTestingModule, OverviewCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverviewCardComponent);
    component = fixture.componentInstance;
    amountDisplay = TestBed.inject(AmountDisplayModeService);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem(AMOUNT_DISPLAY_OVERRIDE_STORAGE_KEY);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('reformats a fixed national-policy grant amount (e.g. Special Infrastructure) when the amount-display override changes', () => {
    const overviewData: OverviewData = {
      name: 'Test State',
      financialYear: 'FY-2024',
      totalAllocation: 1000,
      totalAllocationNote: 'For 10 ULBs',
      grantSections: [
        {
          id: 'specialInfrastructure',
          label: 'Special Infrastructure',
          componentLabel: 'Grant Component',
          title: 'Special Infrastructure Grants',
          amount: 561_000_000_000,
          amountSuffix: 'for 22 cities',
          points: [],
        },
      ],
    };

    component.overviewData = overviewData;
    component.ngOnChanges({ overviewData: {} as any });
    fixture.detectChanges();

    const grant = component.selectedGrant;
    expect(component.isAmountNumber(grant?.amount)).toBe(true);

    amountDisplay.setOverride('cr');
    expect(component.formatAmount(grant!.amount as number)).toBe('₹ 56,100 Cr');

    amountDisplay.setOverride('lakh');
    expect(component.formatAmount(grant!.amount as number)).toBe('₹ 56,10,000 Lakh');
  });
});
