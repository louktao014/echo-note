import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryDetailDialog } from './history-detail-dialog';

describe('HistoryDetailDialog', () => {
  let component: HistoryDetailDialog;
  let fixture: ComponentFixture<HistoryDetailDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryDetailDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryDetailDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
