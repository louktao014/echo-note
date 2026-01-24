import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AudioService } from '../services/audio.service';
import { TranscriptService } from '../services/transcript.service';
import { MeetingService } from '../services/meeting.service';
import { CommonModule } from '@angular/common';
import { TranscriptComponent } from '../transcript/transcript.component';
import { MomResultComponent } from '../mom-result/mom-result.component';
import { UploadAudioComponent } from '../upload-audio/upload-audio.component';
import { HistoryComponent } from '../history/history.component';
import { EnumStep } from '../model/meeting-pipeline.model';
import { MatDialog } from '@angular/material/dialog';
import { StatusDialogComponent } from '../dialog/status-dialog.component';

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
  step = signal<EnumStep>(EnumStep.UPLOAD);
  EnumStep = EnumStep;

  transcript = signal('');
  mom = signal<any>(null);
  private audioService = inject(AudioService);
  private transcriptService = inject(TranscriptService);
  private meetingService = inject(MeetingService);
  private dialog = inject(MatDialog);

  onUpload(file: File) {
    this.step.set(EnumStep.LOADING);
    this.audioService.speechToText(file).subscribe({
      next: (response: any) => {
        this.step.set(EnumStep.TRANSCRIPT);
        console.log('response =>', response);
        if (response?.transcript) {
          this.transcript.set(response?.transcript);
        } else {
          this.step.set(EnumStep.UPLOAD);
          console.warn('response.text is undefined');
        }
      },
      error: (error) => {
        this.step.set(EnumStep.UPLOAD);
        console.warn('error', error);
      },
    });
  }

  openStatusDialog(status: string) {
    const isSuccess = status === 'success';
    const dialogData = {
      title: 'Status',
      message: isSuccess ? 'Done' : 'Something went wrong',
      status: isSuccess ? 'success' : 'error',
    };
    this.dialog.open(StatusDialogComponent, { width: '500px', data: dialogData });
  }

  downloadFile(filePath: string) {
    const urlPath = `packages/backend/${filePath}`;
    console.log(urlPath);
  }

  onConfirmTranscript(text: string) {
    this.step.set(EnumStep.GENERATING);
    const chunks = this.transcriptService.chunk(text);
    this.meetingService.generateMoM(chunks).subscribe((result: any) => {
      console.log('generateMoM', result);
      const { mom } = result;
      this.mom.set(mom);
      this.step.set(EnumStep.DONE);
    });
  }
}
