import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  input,
  Output,
  signal,
} from '@angular/core';
import { ITranscript } from '../model/transcript.mode';
import { TranscriptService } from '../services/transcript.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { EMPTY, switchMap } from 'rxjs';
import { EnumStep } from '../model/meeting-pipeline.model';
import { StatusDialogComponent } from '../dialog/status-dialog.component';
import {
  EnumLoadingStyle,
  LoadingDialogComponent,
  LoadingDialogData,
} from '../loading-dialog/loading-dialog.component';

@Component({
  selector: 'app-mom-result',
  templateUrl: './mom-result.component.html',
  styleUrls: ['./mom-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MomResultComponent {
  private dialog = inject(MatDialog);
  private loadingDialogRef?: MatDialogRef<LoadingDialogComponent>;
  transcriptService = inject(TranscriptService);

  momContent = signal<string>('');
  mom = input('');
  @Output() setStep = new EventEmitter<EnumStep>();

  onSave(subJectValue: string) {
    if (subJectValue) {
      this.dialog
        .open(ConfirmDialogComponent, {
          width: '500px',
        })
        .afterClosed()
        .pipe(
          switchMap((isConfirm: boolean) => {
            if (isConfirm) {
              this.onLoading(true);
              const payload = this.preparingPayloadTranscript(subJectValue);
              return this.transcriptService.saveTranscript(payload);
            }
            return EMPTY;
          })
        )
        .subscribe({
          next: () => {
            this.onLoading(false);
          },
          error: (err) => {
            console.warn('save transcript error', err);
            this.openStatusDialog(false, 'Something Went Wrong');
            this.onLoading(false);
          },
        });
    } else {
      this.openStatusDialog(false, 'Please, enter subject name');
    }
  }

  onLoading(isLoading: boolean) {
    if (isLoading) {
      this.loadingDialogRef = this.openDialogLoading();
      this.loadingDialogRef.afterClosed().subscribe({
        next: () => {
          this.openStatusDialog(true, 'Save Transcript Complete');
        },
        error: () => {
          this.openStatusDialog(false, 'Something Went Wrong');
        },
      });
    } else {
      this.loadingDialogRef?.close();
      this.loadingDialogRef = undefined;
    }
  }

  openDialogLoading() {
    const dataDialog = {
      width: '200px',
      height: '200px',
      data: {
        style: EnumLoadingStyle.SPRING,
        message: 'Saving Transcript',
        config: { isClosable: true },
      } as LoadingDialogData,
      disableClose: true,
    };
    return this.dialog.open(LoadingDialogComponent, dataDialog);
  }

  openStatusDialog(isSuccess: boolean, message: string) {
    const dialogData = {
      title: isSuccess ? 'Done' : 'Error',
      message,
      status: isSuccess ? 'success' : 'error',
    };
    this.dialog
      .open(StatusDialogComponent, {
        width: '500px',
        data: dialogData,
      })
      .afterClosed()
      .subscribe(() => {
        if (isSuccess) {
          this.setStep.emit(EnumStep.HISTORY);
        }
      });
  }

  preparingPayloadTranscript(subJect: string) {
    const now = new Date().toISOString();
    const payload: ITranscript = {
      user_id: '0',
      sub_ject: subJect,
      content: this.mom(),
      created_at: new Date(now).toLocaleString('th-TH', {
        timeZone: 'Asia/Bangkok',
      }),
      updated_at: new Date(now).toLocaleString('th-TH', {
        timeZone: 'Asia/Bangkok',
      }),
    };
    return payload;
  }

  onCopyToClipboard() {
    navigator.clipboard.writeText(this.mom());
  }
}
