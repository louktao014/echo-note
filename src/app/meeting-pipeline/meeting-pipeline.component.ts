import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AudioService } from '../services/audio.service';
import { TranscriptService } from '../services/transcript.service';
import { MeetingService } from '../services/meeting.service';
import { CommonModule } from '@angular/common';
import { TranscriptComponent } from '../transcript/transcript.component';
import { MomResultComponent } from '../mom-result/mom-result.component';
import { UploadAudioComponent } from '../upload-audio/upload-audio.component';

@Component({
  selector: 'app-meeting-pipeline',
  templateUrl: './meeting-pipeline.component.html',
  styleUrls: ['./meeting-pipeline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule,TranscriptComponent,UploadAudioComponent,MomResultComponent],
})
export class MeetingPipelineComponent {
  step = signal< 'UPLOAD' | 'TRANSCRIBE' | 'TRANSCRIPT' | 'GENERATING' | 'DONE'>('UPLOAD');

  transcript = signal('');
  mom = signal<any>(null);
  audioService = inject(AudioService);
  transcriptService = inject(TranscriptService);
  meetingService = inject(MeetingService);


  constructor(
  ) {}

  onUpload(file: File) {
    this.step.set('TRANSCRIBE');
    this.audioService.transcribe(file).subscribe((res) => {
      this.transcript.set(res.transcript);
      this.step.set('TRANSCRIPT');
    });
  }

  onConfirmTranscript(text: string) {
    this.step.set('GENERATING');
    const chunks = this.transcriptService.chunk(text);

    this.meetingService.generateMoM(chunks).subscribe((mom) => {
      this.mom.set(mom);
      this.step.set('DONE');
    });
  }
}
