import { TestBed } from '@angular/core/testing';

import { DrawGraphService } from './draw-graph.service';

describe('DrawGraphService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DrawGraphService = TestBed.get(DrawGraphService);
    expect(service).toBeTruthy();
  });
});
