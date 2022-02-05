import { TestBed } from '@angular/core/testing';

import { TeeTimesheetService } from './tee-timesheet.service';

describe('TeeTimesheetService', () => {
  let service: TeeTimesheetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TeeTimesheetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
