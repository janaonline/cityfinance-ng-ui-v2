import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ClaimLetterSummaryTilesComponent } from './claim-letter-summary-tiles.component';

describe('ClaimLetterSummaryTilesComponent', () => {
  let fixture: ComponentFixture<ClaimLetterSummaryTilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimLetterSummaryTilesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ClaimLetterSummaryTilesComponent);
  });

  it('renders one tile per input entry, with its label and a whole-Rupee amount auto-scaled to Cr', () => {
    fixture.componentRef.setInput('tiles', [
      { label: 'Total Allocation', value: 250_000_000 },
      { label: 'Already Claimed', value: 50_000_000 },
    ]);
    fixture.detectChanges();

    const tiles = fixture.debugElement.queryAll(By.css('.summary-tile'));
    expect(tiles.length).toBe(2);
    expect(tiles[0].nativeElement.textContent).toContain('Total Allocation');
    expect(tiles[0].nativeElement.textContent).toContain('25 Cr');
    expect(tiles[1].nativeElement.textContent).toContain('Already Claimed');
    expect(tiles[1].nativeElement.textContent).toContain('5 Cr');
  });

  it('renders nothing when given an empty tile list', () => {
    fixture.componentRef.setInput('tiles', []);
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('.summary-tile')).length).toBe(0);
  });

  it('applies the emphasized class only to tiles flagged emphasized', () => {
    fixture.componentRef.setInput('tiles', [
      { label: 'Available to Claim', value: 15, emphasized: true },
      { label: 'Total Allocation', value: 25 },
    ]);
    fixture.detectChanges();

    const tiles = fixture.debugElement.queryAll(By.css('.summary-tile'));
    expect(tiles[0].nativeElement.classList).toContain('summary-tile-emphasized');
    expect(tiles[1].nativeElement.classList).not.toContain('summary-tile-emphasized');
  });
});
