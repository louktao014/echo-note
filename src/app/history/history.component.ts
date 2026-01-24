import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { HistoryDetailDialogComponent } from '../history-detail-dialog/history-detail-dialog';
import { TranscriptService } from '../services/transcript.service';
import { ITranscript } from '../model/transcript.mode';
import { EMPTY, of, switchMap } from 'rxjs';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

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

  ngOnInit(): void {
    this.getAllTranscripts();
  }

  getAllTranscripts() {
    this.transcriptService.getAllTranscript().subscribe({
      next: (result: any) => {
        console.log('result', result);
        this.history.set(result.data);
        console.log('history', this.history());
      },
      error: (error) => {
        console.warn('error', error);
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
            const { id: transcriptID } = item;
            return this.deleteTranscript(transcriptID);
          }
          return EMPTY;
        })
      )
      .subscribe({
        next: (response: any) => {
          console.log('delete success', response);
        },
        error: (error) => {
          console.warn('error', error);
        },
      });
    return;
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
      title: `Transcription from ${new Date().toLocaleDateString()}`,
      content: item.content,
      date: new Date(),
    };

    this.dialog.open(HistoryDetailDialogComponent, {
      width: '500px',
      data: dialogData,
    });
  }
}
