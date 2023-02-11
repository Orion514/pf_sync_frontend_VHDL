import { TestBed } from '@angular/core/testing';

import { VerficationService } from './verfication.service';

describe('VerficationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VerficationService = TestBed.get(VerficationService);
    expect(service).toBeTruthy();
  });
});