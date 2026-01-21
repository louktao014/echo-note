import { TestBed } from '@angular/core/testing';

import { MeetingData } from './meeting-data';

describe('MeetingData', () => {
  let service: MeetingData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MeetingData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
