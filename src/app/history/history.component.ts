import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { HistoryService } from '../services/history.service';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { HistoryDetailDialogComponent } from '../history-detail-dialog/history-detail-dialog';
import { TranscriptService } from '../services/transcript.service';
import { ITranscript } from '../model/transcript.mode';
import { EMPTY, switchMap } from 'rxjs';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class HistoryComponent implements OnInit {
  private historyService = inject(HistoryService);
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
      },
      error: (error) => {
        console.warn('error', error);
      },
    });
  }

  removeItem(item: ITranscript) {
    console.log('removeItem', item);
    if (item.id) {
      this.transcriptService
        .deleteTranscript(item.id)
        .pipe(
          switchMap((response: any) => {
            if (!response.error) {
              return this.transcriptService.getAllTranscript();
            } else {
              return EMPTY;
            }
          })
        )
        .subscribe({
          next: (response: any) => {
            console.log('delete success');
            this.history.set(response.data);
          },
          error: (error) => {
            console.warn('error', error);
          },
        });
    }
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
