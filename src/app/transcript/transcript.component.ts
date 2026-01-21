import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';


@Component({
  selector: 'app-transcript',
  templateUrl: './transcript.component.html',
  styleUrls: ['./transcript.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class TranscriptComponent {
  transcript = input<string>('');
  confirm = output<string>();

  proceed() {
    this.confirm.emit(this.transcript());
  }
}
