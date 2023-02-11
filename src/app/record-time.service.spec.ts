import { TestBed } from "@angular/core/testing";

import { RecordTimeService } from "./record-time.service";

describe("RecordTimeService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: RecordTimeService = TestBed.get(RecordTimeService);
    expect(service).toBeTruthy();
  });
});
