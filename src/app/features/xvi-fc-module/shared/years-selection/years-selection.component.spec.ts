import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YearsSelectionComponent } from './years-selection.component';

describe('YearsSelectionComponent', () => {
  let component: YearsSelectionComponent;
  let fixture: ComponentFixture<YearsSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YearsSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YearsSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
