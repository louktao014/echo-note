import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-mom-result',
  templateUrl: './mom-result.component.html',
  styleUrls: ['./mom-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MomResultComponent {
  momContent = signal<string>('');
  mom = input('');

  saveTranscript() {
    const blob = new Blob([this.mom()], { type: 'text/plain' });
    console.log('saveTranscript', blob);
  }

  onCopyToClipboard() {
    navigator.clipboard.writeText(this.mom());
  }
}
