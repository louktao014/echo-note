import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HistoryDetailDialogComponent } from '../history-detail-dialog/history-detail-dialog.component';
import { TranscriptService } from '../services/transcript.service';
import { ITranscript } from '../model/transcript.mode';
import { EMPTY, of, switchMap } from 'rxjs';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { StatusDialogComponent } from '../dialog/status-dialog.component';
import {
  EnumLoadingStyle,
  LoadingDialogComponent,
  LoadingDialogData,
} from '../loading-dialog/loading-dialog.component';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class HistoryComponent implements OnInit {
  private transcriptService = inject(TranscriptService);
  private dialog = inject(MatDialog);
  history = signal<ITranscript[]>([]);
  private loadingDialogRef?: MatDialogRef<LoadingDialogComponent>;

  ngOnInit(): void {
    this.getAllTranscripts();
  }

  getAllTranscripts() {
    this.onLoading(true);
    this.transcriptService.getAllTranscript().subscribe({
      next: (result: any) => {
        this.history.set(result.data);
        console.log('history', this.history());
        this.onLoading(false);
      },
      error: (error) => {
        console.warn('error', error);
        this.onLoading(false);
      },
    });
  }

  removeItem(item: ITranscript) {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '500px',
      })
      .afterClosed()
      .pipe(
        switchMap((isConfirm: boolean) => {
          if (item?.id && isConfirm) {
            this.onLoading(true, 'Delete Transcript');
            const { id: transcriptID } = item;
            return this.deleteTranscript(transcriptID);
          }
          return EMPTY;
        }),
        switchMap((response: any) => {
          let statusDialog = 'success';
          if (response?.error) {
            this.onLoading(false);
            statusDialog = 'error';
          }
          this.openDialogStatus(statusDialog, item);
          return of(response);
        })
      )
      .subscribe({
        next: (response: any) => {
          console.log('delete success', response);
          this.onLoading(false);
        },
        error: (error) => {
          console.warn('error', error);
          this.onLoading(false);
        },
      });
  }

  onLoading(isLoading: boolean, message: string = 'Get Transcript') {
    if (isLoading) {
      this.loadingDialogRef = this.dialog.open(LoadingDialogComponent, {
        width: '200px',
        height: '200px',
        data: {
          style: EnumLoadingStyle.SPRING,
          message,
          config: { isClosable: true },
        } as LoadingDialogData,
        disableClose: true,
      });
    } else {
      this.loadingDialogRef?.close();
      this.loadingDialogRef = undefined;
    }
  }

  openDialogStatus(status: string, item: ITranscript) {
    const dialogData = {
      title: status === 'success' ? 'Success' : 'Error',
      message:
        status === 'success' ? `Delete '${item.sub_ject}' successfully` : 'Something went wrong',
      status: status,
    };
    this.dialog
      .open(StatusDialogComponent, { width: '400px', data: dialogData })
      .afterClosed()
      .subscribe(() => this.onLoading(false));
  }

  deleteTranscript(transcriptID: string) {
    return this.transcriptService.deleteTranscript(transcriptID).pipe(
      switchMap((response: any) => {
        if (!response?.error) {
          this.history.update((items) => items.filter((item) => item.id !== transcriptID));
        }
        return of(response);
      })
    );
  }

  openDialog(item: ITranscript): void {
    const dialogData = {
      title: `${item.sub_ject}, Date :${new Date().toLocaleDateString()}`,
      content: item.content,
      date: new Date(),
    };

    this.dialog.open(HistoryDetailDialogComponent, {
      width: '500px',
      data: dialogData,
    });
  }

  addTranscript() {
    this.onLoading(true);
    const subject = 'test';
    const content = 'test';
    const payload = this.preparingPayloadTranscript(subject, content);
    this.transcriptService.saveTranscript(payload).subscribe({
      next: (result: any) => {
        console.log('result', result);
        this.onLoading(false);
      },
      error: (error) => {
        console.warn('error', error);
        this.onLoading(false);
      },
    });
  }

  preparingPayloadTranscript(subJect: string, content: string) {
    const now = new Date().toISOString();
    const payload: ITranscript = {
      user_id: '0',
      sub_ject: subJect,
      content: content,
      created_at: new Date(now).toLocaleString('th-TH', {
        timeZone: 'Asia/Bangkok',
      }),
      updated_at: new Date(now).toLocaleString('th-TH', {
        timeZone: 'Asia/Bangkok',
      }),
    };
    return payload;
  }
}
