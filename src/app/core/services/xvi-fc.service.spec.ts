import { TestBed } from '@angular/core/testing';

import { XviFcService } from './xvi-fc.service';

describe('XviFcService', () => {
  let service: XviFcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(XviFcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});