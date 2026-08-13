import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { NotEligibleComponent } from './not-eligible.component';

describe('NotEligibleComponent', () => {
  let component: NotEligibleComponent;
  let fixture: ComponentFixture<NotEligibleComponent>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['logout']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    routerSpy.navigate.and.resolveTo(true);

    await TestBed.configureTestingModule({
      imports: [NotEligibleComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotEligibleComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('navigates to the 16thFC login once logout() completes', () => {
    authSpy.logout.and.returnValue(of(null));

    component.logout();

    expect(authSpy.logout).toHaveBeenCalledTimes(1);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth', 'login', '16thFC'], { replaceUrl: true });
  });

  it('does not navigate before logout() actually emits — regression test for the "needs two clicks" bug', () => {
    let emit: (() => void) | undefined;
    authSpy.logout.and.returnValue(
      new Observable<null>((subscriber) => {
        emit = () => {
          subscriber.next(null);
          subscriber.complete();
        };
      }),
    );

    component.logout();
    expect(routerSpy.navigate).not.toHaveBeenCalled();

    emit?.();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth', 'login', '16thFC'], { replaceUrl: true });
  });
});
