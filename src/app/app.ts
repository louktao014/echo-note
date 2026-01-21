import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MeetingPipelineComponent } from './meeting-pipeline/meeting-pipeline.component';

@Component({
  selector: 'app-root',
  imports: [MeetingPipelineComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly title = signal('EchoNote');
}
