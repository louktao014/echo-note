import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { ITranscript } from '../model/transcript.mode';
import { TranscriptService } from '../services/transcript.service';

@Component({
  selector: 'app-mom-result',
  templateUrl: './mom-result.component.html',
  styleUrls: ['./mom-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MomResultComponent {
  momContent = signal<string>('');
  mom = input('');
  transcriptService = inject(TranscriptService);

  saveTranscript(subJect: string) {
    const payload = this.preparingPayloadTranscript(subJect);
    this.transcriptService.saveTranscript(payload).subscribe({
      next: () => {
        console.log('save transcript success');
      },
      error: (err) => {
        console.warn('save transcript error', err);
      },
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
