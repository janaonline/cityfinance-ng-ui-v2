import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatCommonTableComponent } from './mat-common-table.component';

describe('MatCommonTableComponent', () => {
  let component: MatCommonTableComponent;
  let fixture: ComponentFixture<MatCommonTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatCommonTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MatCommonTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
