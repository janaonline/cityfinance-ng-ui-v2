import { TestBed } from '@angular/core/testing';

import { XvifcModuleService } from './xvifc-module.service';

describe('XvifcModuleService', () => {
  let service: XvifcModuleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(XvifcModuleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
