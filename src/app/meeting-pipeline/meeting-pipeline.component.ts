import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AudioService } from '../services/audio.service';
import { TranscriptService } from '../services/transcript.service';
import { MeetingService } from '../services/meeting.service';
import { CommonModule } from '@angular/common';
import { TranscriptComponent } from '../transcript/transcript.component';
import { MomResultComponent } from '../mom-result/mom-result.component';
import { UploadAudioComponent } from '../upload-audio/upload-audio.component';
import { HistoryComponent } from '../history/history.component';

@Component({
  selector: 'app-meeting-pipeline',
  templateUrl: './meeting-pipeline.component.html',
  styleUrls: ['./meeting-pipeline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    TranscriptComponent,
    UploadAudioComponent,
    MomResultComponent,
    HistoryComponent,
  ],
})
export class MeetingPipelineComponent {
  step = signal<
    | 'UPLOAD'
    | 'TRANSCRIBE'
    | 'LOADING'
    | 'TRANSCRIPT'
    | 'GENERATING'
    | 'HISTORY'
    | 'DONE'
    | 'FINISH'
    | 'ALL'
  >('UPLOAD');

  transcript = signal('');
  mom = signal<any>(null);
  audioService = inject(AudioService);
  transcriptService = inject(TranscriptService);
  meetingService = inject(MeetingService);

  onUpload(file: File) {
    this.step.set('LOADING');
    this.audioService.speechToText(file).subscribe({
      next: (response: any) => {
        this.step.set('TRANSCRIPT');
        console.log('response =>', response);
        if (response?.transcript) {
          this.transcript.set(response?.transcript);
        } else {
          this.step.set('UPLOAD');
          console.warn('response.text is undefined');
        }
      },
      error: (error) => {
        this.step.set('UPLOAD');
        console.warn('error', error);
      },
    });
  }

  downloadFile(filePath: string) {
    const urlPath = `packages/backend/${filePath}`;
    console.log(urlPath);
  }

  onConfirmTranscript(text: string) {
    this.step.set('GENERATING');
    const chunks = this.transcriptService.chunk(text);
    this.meetingService.generateMoM(chunks).subscribe((result: any) => {
      console.log('generateMoM', result);
      const { mom } = result;
      this.mom.set(mom);
      this.step.set('DONE');
    });
  }
}
