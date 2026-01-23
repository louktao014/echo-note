import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

export interface HistoryDetailData {
  title: string;
  content: string;
  date: Date;
}

@Component({
  selector: 'app-history-detail-dialog',
  templateUrl: './history-detail-dialog.html',
  styleUrls: ['./history-detail-dialog.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatDialogModule],
})
export class HistoryDetailDialogComponent {
  public data: HistoryDetailData = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<HistoryDetailDialogComponent>);

  closeDialog(): void {
    this.dialogRef.close();
  }
}
