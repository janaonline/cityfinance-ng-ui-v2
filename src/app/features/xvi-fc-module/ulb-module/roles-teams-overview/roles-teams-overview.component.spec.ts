import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesTeamsOverviewComponent } from './roles-teams-overview.component';

describe('RolesTeamsOverviewComponent', () => {
  let component: RolesTeamsOverviewComponent;
  let fixture: ComponentFixture<RolesTeamsOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolesTeamsOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolesTeamsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
