import { TestBed } from '@angular/core/testing';
import { GlobalLoaderService } from './global-loader.service';

describe('GlobalLoaderService', () => {
  let service: GlobalLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize loading as false', () => {
    expect(service.loading()).toBe(false);
  });

  it('should set loading to true when showLoader() is called', () => {
    expect(service.loading()).toBe(false);

    service.showLoader();

    expect(service.loading()).toBe(true);
  });

  it('should set loading to false when stopLoader() is called', () => {
    service.showLoader();
    expect(service.loading()).toBe(true);

    service.stopLoader();

    expect(service.loading()).toBe(false);
  });

  it('should keep loading as false when stopLoader() is called while already false', () => {
    expect(service.loading()).toBe(false);

    service.stopLoader();

    expect(service.loading()).toBe(false);
  });

  it('should keep loading as true when showLoader is called multiple times', () => {
    service.showLoader();
    service.showLoader();

    expect(service.loading()).toBe(true);
  });

  it('should toggle loading from false to true to false', () => {
    // Arrange
    expect(service.loading()).toBe(false);

    // Act
    service.showLoader();
    const afterShow = service.loading();

    service.stopLoader();
    const afterStop = service.loading();

    // Assert
    expect(afterShow).toBe(true);
    expect(afterStop).toBe(false);
  });
});
