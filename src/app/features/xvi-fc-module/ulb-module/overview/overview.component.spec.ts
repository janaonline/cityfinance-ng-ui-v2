import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewComponent } from './overview.component';
import { UlbNotificationService } from '../ulb-notification.service';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;

  beforeEach(async () => {
    // Otherwise ngOnInit's one-time video-walkthrough popup would actually try to open a real
    // MatDialog on every test in this file (the "seen" flag won't exist yet on a fresh run).
    localStorage.setItem('hasSeenXvifcVideoWalkthrough', 'true');

    await TestBed.configureTestingModule({ providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} }], imports: [HttpClientTestingModule, RouterTestingModule, OverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem('hasSeenXvifcVideoWalkthrough');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the ULB notification form status on init', () => {
    const ulbNotifications = TestBed.inject(UlbNotificationService);
    const ensureLoadedSpy = spyOn(ulbNotifications, 'ensureLoadedForUlb').and.resolveTo();

    component.ngOnInit();

    expect(ensureLoadedSpy).toHaveBeenCalled();
  });

  it('does not throw when userData in localStorage is malformed JSON', () => {
    localStorage.setItem('userData', 'not-json{{{');

    expect(() => component.ngOnInit()).not.toThrow();

    localStorage.removeItem('userData');
  });
});
