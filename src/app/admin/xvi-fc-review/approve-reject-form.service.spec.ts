import { TestBed } from '@angular/core/testing';

import { ApproveRejectFormService } from './approve-reject-form.service';

xdescribe('ApproveRejectFormService', () => {
  let service: ApproveRejectFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApproveRejectFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
