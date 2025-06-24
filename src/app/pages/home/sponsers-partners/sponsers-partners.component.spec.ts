import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SponsersPartnersComponent } from './sponsers-partners.component';

describe('SponsersPartnersComponent', () => {
  let component: SponsersPartnersComponent;
  let fixture: ComponentFixture<SponsersPartnersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SponsersPartnersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SponsersPartnersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
