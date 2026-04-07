import { TestBed } from '@angular/core/testing';

import { DynamicFormVisibilityService } from './dynamic-form-visibility.service';

describe('DynamicFormVisibilityService', () => {
  let service: DynamicFormVisibilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DynamicFormVisibilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
