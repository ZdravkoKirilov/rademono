import { TestBed } from '@angular/core/testing';

import { UnauthorizedInterceptor } from './unauthorized-interceptor.service';

describe('UnauthorizedInterceptorService', () => {
  let service: UnauthorizedInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnauthorizedInterceptor);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
