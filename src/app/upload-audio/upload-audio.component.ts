import { ChangeDetectionStrategy, Component, signal, output } from '@angular/core';

@Component({
  selector: 'app-upload-audio',
  templateUrl: './upload-audio.component.html',
  styleUrls: ['./upload-audio.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadAudioComponent {
  public audioUploaded = output<File>();

  public isDragOver = signal(false);
  public selectedFile = signal<File | null>(null);
  public audioUrl = signal<string | null>(null);

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
    if (file.type.startsWith('audio/')) {
      this.selectedFile.set(file);
      this.audioUrl.set(URL.createObjectURL(file));
    } else {
      console.warn('Unsupported file type:', file.type);
    }
  }

  private resetState(): void {
    const url = this.audioUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
    this.selectedFile.set(null);
    this.audioUrl.set(null);
  }
}
