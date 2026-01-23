import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-transcript',
  templateUrl: './transcript.component.html',
  styleUrls: ['./transcript.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
})
export class TranscriptComponent {
  transcript = input<string>('');
  confirm = output<string>();

  isEditing = signal(false);
  editedTranscript = signal('');

  constructor() {
    effect(() => {
      this.editedTranscript.set(this.transcript());
    });
  }

  toggleEditSave() {
    this.isEditing.update((editing) => !editing);
    // When saving, the value is already updated in editedTranscript via ngModel
  }

  proceed() {
    this.confirm.emit(this.editedTranscript());
  }
}
