import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MeetingPipelineComponent } from './meeting-pipeline/meeting-pipeline.component';
import { HttpClient } from '@angular/common/http';
import { HistoryComponent } from './history/history.component';
import { HistoryService } from './services/history.service';

@Component({
  selector: 'app-root',
  imports: [MeetingPipelineComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly title = signal('EchoNote');
  http = inject(HttpClient);
  private historyService = inject(HistoryService);

  constructor() {
    this.http.get('/api/health').subscribe({
      next: (res) => {
        console.log('NEXT:=>', res);
      },
      error: (err) => {
        console.warn('ERROR:', err);
      },
    });

    // Add some initial history data for demonstration
    this.historyService.addToHistory('First item');
    this.historyService.addToHistory('Second item');
  }
}
