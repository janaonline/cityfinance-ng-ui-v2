import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { ProfileVerificationComponent } from './profile-verification.component';

describe('ProfileVerificationComponent', () => {
  let component: ProfileVerificationComponent;
  let fixture: ComponentFixture<ProfileVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileVerificationComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
