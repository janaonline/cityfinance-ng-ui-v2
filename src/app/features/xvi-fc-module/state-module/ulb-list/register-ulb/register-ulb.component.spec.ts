import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterUlbComponent } from './register-ulb.component';

describe('RegisterUlbComponent', () => {
  let component: RegisterUlbComponent;
  let fixture: ComponentFixture<RegisterUlbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ yearId: 'year-1' }) } },
        },
      ],
      imports: [HttpClientTestingModule, RouterTestingModule, RegisterUlbComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterUlbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('reads yearId from the route params', () => {
    expect(component.yearId).toBe('year-1');
  });
});
