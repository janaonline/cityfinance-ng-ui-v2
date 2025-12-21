import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfsTableComponent } from './afs-table.component';

describe('AfsTableComponent', () => {
  let component: AfsTableComponent;
  let fixture: ComponentFixture<AfsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AfsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
