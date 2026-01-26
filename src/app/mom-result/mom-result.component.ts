import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  input,
  Output,
  output,
  signal,
} from '@angular/core';
import { ITranscript } from '../model/transcript.mode';
import { TranscriptService } from '../services/transcript.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { EMPTY, switchMap } from 'rxjs';
import { EnumStep } from '../model/meeting-pipeline.model';
import { StatusDialogComponent } from '../dialog/status-dialog.component';

@Component({
  selector: 'app-mom-result',
  templateUrl: './mom-result.component.html',
  styleUrls: ['./mom-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MomResultComponent {
  transcriptService = inject(TranscriptService);
  private dialog = inject(MatDialog);

  momContent = signal<string>('');
  mom = input('');
  @Output() setStep = new EventEmitter<EnumStep>();

  onSave(subJect: string) {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '500px',
      })
      .afterClosed()
      .pipe(
        switchMap((isConfirm: boolean) => {
          if (isConfirm) {
            const payload = this.preparingPayloadTranscript(subJect);
            return this.transcriptService.saveTranscript(payload);
          }
          return EMPTY;
        })
      )
      .subscribe({
        next: () => {
          console.log('save transcript success');
          this.openStatusDialog(true);
        },
        error: (err) => {
          console.warn('save transcript error', err);
          this.openStatusDialog(false);
        },
      });
  }

  openStatusDialog(isSuccess: boolean) {
    const dialogData = {
      title: isSuccess ? 'Done' : 'Error',
      message: isSuccess ? 'Save Transcript Complete' : 'Something Went Wrong',
      status: isSuccess ? 'success' : 'error',
    };
    this.dialog
      .open(StatusDialogComponent, {
        width: '500px',
        data: dialogData,
      })
      .afterClosed()
      .subscribe(() => {
        this.setStep.emit(EnumStep.HISTORY);
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
