import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterUlbComponent } from './register-ulb.component';

describe('RegisterUlbComponent', () => {
  let component: RegisterUlbComponent;
  let fixture: ComponentFixture<RegisterUlbComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ yearId: 'year-1' }) } },
        },
      ],
      imports: [HttpClientTestingModule, RouterTestingModule, RegisterUlbComponent],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(RegisterUlbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the Register ULB heading', () => {
    const heading = fixture.nativeElement.querySelector('h1');
    expect(heading.textContent.trim()).toBe('Register ULB');
  });

  it('renders the under-development message', () => {
    expect(fixture.nativeElement.textContent).toContain('This page is under development.');
  });

  it('reads yearId from the route params', () => {
    expect(component.yearId).toBe('year-1');
  });

  it('does not make any HTTP calls', () => {
    httpMock.verify();
  });

  it('Back button navigates to the state overview page for the current yearId', () => {
    const router = TestBed.inject(Router);
    const navSpy = spyOn(router, 'navigate');

    const backButton = fixture.nativeElement.querySelector('button');
    backButton.click();

    expect(navSpy).toHaveBeenCalledWith(['/xvifc', 'year-1', 'overview']);
  });
});
