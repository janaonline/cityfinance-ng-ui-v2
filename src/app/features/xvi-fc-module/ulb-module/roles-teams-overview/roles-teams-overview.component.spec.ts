import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UlbRolesTeamsOverviewComponent } from './roles-teams-overview.component';

describe('UlbRolesTeamsOverviewComponent', () => {
  let component: UlbRolesTeamsOverviewComponent;
  let fixture: ComponentFixture<UlbRolesTeamsOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UlbRolesTeamsOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UlbRolesTeamsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
