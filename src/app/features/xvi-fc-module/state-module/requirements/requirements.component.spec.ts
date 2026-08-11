import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthService } from '../../../../core/services/auth.service';
import { RequirementsComponent } from './requirements.component';

describe('RequirementsComponent', () => {
  let component: RequirementsComponent;
  let fixture: ComponentFixture<RequirementsComponent>;

  beforeEach(async () => {
    // AuthService is provided app-wide (app.config.ts), not `providedIn: 'root'` on the class
    // itself, so TestBed needs an explicit provider — XvifcModuleService (root-provided) also
    // injects it transitively. A stub with no current user is enough: the component's `load()`
    // guard just surfaces a "context unavailable" error state without calling any HTTP service.
    const authService = jasmine.createSpyObj<AuthService>('AuthService', ['getCurrentUserSnapshot']);
    authService.getCurrentUserSnapshot.and.returnValue(null);

    await TestBed.configureTestingModule({
      providers: [
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: AuthService, useValue: authService },
      ],
      imports: [HttpClientTestingModule, RouterTestingModule, RequirementsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RequirementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
