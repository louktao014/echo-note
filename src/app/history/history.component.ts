import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HistoryService } from '../services/history.service';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { HistoryDetailDialogComponent } from '../history-detail-dialog/history-detail-dialog';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class HistoryComponent {
  private historyService = inject(HistoryService);
  private dialog = inject(MatDialog);
  history = this.historyService.getHistory();

  removeItem(item: string) {
    this.historyService.removeFromHistory(item);
  }

  openDialog(item: string): void {
    const dialogData = {
      title: `Transcription from ${new Date().toLocaleDateString()}`,
      content: item,
      date: new Date(),
    };

    this.dialog.open(HistoryDetailDialogComponent, {
      width: '500px',
      data: dialogData,
    });
  }
}
