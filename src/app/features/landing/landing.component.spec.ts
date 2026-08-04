import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { LandingComponent } from './landing.component';

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingComponent, HttpClientTestingModule],
      providers: [provideRouter([])],
    })
    .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    httpMock.expectOne('/assets/files/landing-cards.json').flush({ cards: [] });
  });

  it('loads card data from the landing-cards.json asset', () => {
    const req = httpMock.expectOne('/assets/files/landing-cards.json');
    expect(req.request.method).toBe('GET');
    req.flush({
      cards: [{ title: 'ULB', subtitle: 'ULB', description: '', icon: 'bar_chart', accent: 'green', col: 'col-md-6', route: ['/auth/login'] }],
    });

    expect(component['cards']().length).toBe(1);
  });
});
