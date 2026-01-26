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
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { StatusDialogComponent } from '../dialog/status-dialog.component';
import {
  EnumLoadingStyle,
  LoadingDialogComponent,
  LoadingDialogData,
} from '../loading-dialog/loading-dialog.component';

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
  private loadingDialogRef?: MatDialogRef<LoadingDialogComponent>;

  onUpload(file: File) {
    // this.step.set(EnumStep.LOADING);
    this.onLoading(true);
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
        this.onLoading(false);
      },
      error: (error) => {
        this.step.set(EnumStep.UPLOAD);
        this.onLoading(false);
        console.warn('error', error);
      },
    });
  }

  openStatusDialog(status: string) {
    const isSuccess = status === 'success';
    const dialogData = {
      title: isSuccess ? 'Success' : 'Error',
      message: isSuccess ? 'Done' : 'Something went wrong',
      status: isSuccess ? 'success' : 'error',
    };
    return this.dialog.open(StatusDialogComponent, { width: '400px', data: dialogData });
  }

  onLoading(isLoading: boolean) {
    if (isLoading) {
      this.loadingDialogRef = this.dialog.open(LoadingDialogComponent, {
        width: '200px',
        height: '200px',
        data: {
          style: EnumLoadingStyle.SPRING,
          message: 'Generating',
          config: { isClosable: true },
        } as LoadingDialogData,
        disableClose: true,
      });
    } else {
      this.loadingDialogRef?.close();
      this.loadingDialogRef = undefined;
    }
  }

  downloadFile(filePath: string) {
    const urlPath = `packages/backend/${filePath}`;
    console.log(urlPath);
  }

  onConfirmTranscript(text: string) {
    this.onLoading(true);
    // this.step.set(EnumStep.GENERATING);
    const chunks = this.transcriptService.chunk(text);
    this.meetingService.generateMoM(chunks).subscribe((result: any) => {
      this.onLoading(false);
      console.log('generateMoM', result);
      const { mom } = result;
      this.mom.set(mom);
      this.step.set(EnumStep.DONE);
    });
  }
}
