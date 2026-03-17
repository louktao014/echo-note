import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { StatusDialogComponent } from '../dialog/status-dialog.component';

@Component({
  selector: 'app-transcript',
  templateUrl: './transcript.component.html',
  styleUrls: ['./transcript.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
})
export class TranscriptComponent {
  private dialog = inject(MatDialog);
  transcript = input<string>('');
  confirm = output<{ action: string; content: string }>();

  isEditing = signal(false);
  editedTranscript = signal('');

  constructor() {
    effect(() => {
      this.editedTranscript.set(this.transcript());
    });
  }

  toggleEditSave() {
    this.isEditing.update((editing) => !editing);
    if (!this.isEditing() && this.editedTranscript() !== '') {
      this.openStatusDialog('success', 'Done');
    }
  }
  openStatusDialog(status: string, msg: string) {
    const isSuccess = status === 'success';
    const dialogData = {
      title: 'Status',
      message: msg,
      status: isSuccess ? 'success' : 'error',
    };

    this.dialog.open(StatusDialogComponent, { width: '500px', data: dialogData });
  }

  proceed(action: string) {
    if (this.editedTranscript() === '') {
      this.openStatusDialog('error', 'Transcript is Empty!!');
      return;
    }

    this.confirm.emit({ action, content: this.editedTranscript() });
  }
}
