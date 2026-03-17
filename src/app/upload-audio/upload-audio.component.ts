import { ChangeDetectionStrategy, Component, signal, output, inject } from '@angular/core';
import { AudioService } from '../services/audio.service';
import {
  EnumLoadingStyle,
  LoadingDialogComponent,
  LoadingDialogData,
} from '../loading-dialog/loading-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { StatusDialogComponent } from '../dialog/status-dialog.component';

@Component({
  selector: 'app-upload-audio',
  templateUrl: './upload-audio.component.html',
  styleUrls: ['./upload-audio.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadAudioComponent {
  private audioService = inject(AudioService);

  public audioUploaded = output<File>();

  public isDragOver = signal(false);
  public selectedFile = signal<File | null>(null);
  public audioUrl = signal<string | null>(null);
  public enableConvertVDO = signal<boolean>(false);

  private readonly allowedTypes = ['video/', 'audio/'];
  private loadingDialogRef?: MatDialogRef<LoadingDialogComponent>;
  private dialog = inject(MatDialog);

  public onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  public onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  public onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  public onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  public confirmUpload(): void {
    const file = this.selectedFile();
    if (file) {
      this.audioUploaded.emit(file);
      this.resetState();
    }
  }

  public cancelUpload(): void {
    this.resetState();
  }

  private handleFile(file: File): void {
    if (file && this.checkFileType(file)) {
      if (file.type.startsWith('video')) {
        this.enableConvertVDO.set(true);
      }
      this.selectedFile.set(file);
      this.audioUrl.set(URL.createObjectURL(file));
    } else {
      console.error('Unsupported file type:', file.type);
    }
  }

  private checkFileType(file: File): boolean {
    return this.allowedTypes.some((type) => file.type.startsWith(type));
  }

  public onConvert() {
    const file = this.selectedFile();
    if (file) {
      this.convertFileToMp3(file);
    } else {
      console.error('file is null');
    }
  }

  private convertFileToMp3(file: File) {
    this.onLoading(true);
    this.audioService.convertToAudio(file).subscribe({
      next: (res) => {
        console.log('result =>', res);
        this.onLoading(false);
        this.onOpenDialog('success', 'Convert is Success');
      },
      error: (err) => {
        console.log('error => ', err?.error?.message);
        this.onLoading(false);
        this.onOpenDialog('error', err?.error?.message);
      },
    });
  }

  private resetState(): void {
    const url = this.audioUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
    this.selectedFile.set(null);
    this.audioUrl.set(null);
  }

  onLoading(isLoading: boolean, message: string = 'Processing') {
    if (isLoading) {
      this.loadingDialogRef = this.dialog.open(LoadingDialogComponent, {
        width: '200px',
        height: '200px',
        data: {
          style: EnumLoadingStyle.SPRING,
          message,
          config: { isClosable: true },
        } as LoadingDialogData,
        disableClose: true,
      });
    } else {
      this.loadingDialogRef?.close();
      this.loadingDialogRef = undefined;
    }
  }

  onOpenDialog(status: string, message: string) {
    const dialogData = {
      title: status === 'success' ? 'Success' : 'Error',
      message,
      status: status,
    };
    this.dialog
      .open(StatusDialogComponent, { width: '600px', maxWidth: 'none', data: dialogData })
      .afterClosed()
      .subscribe(() => this.onLoading(false));
  }
}
