import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

export interface statusDialogData {
  title: string;
  message: string;
  status: string;
}

@Component({
  selector: 'app-status-dialog',
  templateUrl: './status-dialog.component.html',
  styleUrls: ['./status-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
})
export class StatusDialogComponent {
  public data: statusDialogData = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<StatusDialogComponent>);

  closeDialog(): void {
    this.dialogRef.close();
  }
}
