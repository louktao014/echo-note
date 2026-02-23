import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface HistoryDetailData {
  title: string;
  content: string;
  date: Date;
}

@Component({
  selector: 'app-history-detail-dialog',
  templateUrl: './history-detail-dialog.component.html',
  styleUrls: ['./history-detail-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatDialogModule],
})
export class HistoryDetailDialogComponent {
  public data: HistoryDetailData = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<HistoryDetailDialogComponent>);
  private snackBar = inject(MatSnackBar);

  closeDialog(): void {
    this.dialogRef.close();
  }
  onCopyToClipboard() {
    navigator.clipboard
      .writeText(this.data.content)
      .then(() => {
        this.snackBar.open('Copy Success', 'ปิด', {
          duration: 53000, // 3 วิ
          horizontalPosition: 'right',
          verticalPosition: 'bottom',
          panelClass: ['success-snackbar'],
        });
      })
      .catch(() => {
        this.snackBar.open('Copy Fail', 'ปิด', {
          duration: 3000, // 3 วิ
          horizontalPosition: 'right',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar'],
        });
      });
  }

  onExit() {
    this.dialogRef.close();
  }
  onSave() {
    this.dialogRef.close();
  }
}
