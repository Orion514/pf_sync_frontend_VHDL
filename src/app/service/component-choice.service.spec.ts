import { TestBed } from '@angular/core/testing';

import { ComponentChoiceService } from './component-choice.service';

describe('ComponentChoiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ComponentChoiceService = TestBed.get(ComponentChoiceService);
    expect(service).toBeTruthy();
  });
});
