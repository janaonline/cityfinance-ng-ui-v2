import { TestBed } from '@angular/core/testing';

import { ReviewTableService } from './review-table.service';

describe('ReviewTableService', () => {
  let service: ReviewTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReviewTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
