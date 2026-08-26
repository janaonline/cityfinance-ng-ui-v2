import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SiteStatusService } from './site-status.service';

describe('SiteStatusService', () => {
  console.log('SiteStatusService test - INIT');
  let service: SiteStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule, RouterTestingModule], providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} }, SiteStatusService],
    }).compileComponents();
    service = TestBed.inject(SiteStatusService);
  });

  it('should be created', () => {
    console.log('SiteStatusService - should be created');
    expect(service).toBeTruthy();
  });

  it('should return True as SiteStatus', () => {
    console.log('SiteStatusService - should return true as SiteStatus');
    expect(service.getIsSiteOnline()).toBeTruthy();
  });

  it('should change to False the SiteStatus', () => {
    console.log('SiteStatusService - should change to False the SiteStatus');
    service.setIsSiteOnline(false);
    expect(service.getIsSiteOnline()).toBeFalsy();
  });
  console.log('SiteStatusService test - STOP');
});
