import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CfrHomeComponent } from './cfr-home.component';

describe('CfrHomeComponent', () => {
  let component: CfrHomeComponent;
  let fixture: ComponentFixture<CfrHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CfrHomeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CfrHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
