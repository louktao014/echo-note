import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export enum EnumLoadingStyle {
  SPRING = 'spring',
  SPINNER = 'spinner',
}

export interface LoadingDialogData {
  style: EnumLoadingStyle;
  message?: string;
  config?: {
    isClosable: boolean;
  };
}

@Component({
  selector: 'app-loading-dialog',
  templateUrl: './loading-dialog.component.html',
  styleUrls: ['./loading-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule],
})
export class LoadingDialogComponent {
  public data: LoadingDialogData = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<LoadingDialogComponent>);
  EnumLoadingStyle = EnumLoadingStyle;

  close() {
    this.dialogRef.close();
  }
}
