import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FcGrantComponent } from './fc-grant.component';

describe('FcGrantComponent', () => {
  let component: FcGrantComponent;
  let fixture: ComponentFixture<FcGrantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FcGrantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FcGrantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
