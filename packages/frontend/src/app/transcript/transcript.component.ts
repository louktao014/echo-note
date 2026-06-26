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
import { EnumAIAgent, EnumAIModel, IConfirmTranscriptParams } from '../model/transcript.mode';

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
  confirm = output<IConfirmTranscriptParams>();

  isEditing = signal<boolean>(false);
  editedTranscript = signal<string>('');
  editedSubject = signal<string>('');
  selectedAIAgent = signal<EnumAIAgent>(EnumAIAgent.OPEN_ROUTER);
  selectedAIModel = signal<EnumAIModel>(EnumAIModel.QWEN_3);
  aiAgentOptions: { priority: number; value: EnumAIAgent }[] = [];
  aiModelOptions = Object.values(EnumAIModel);

  constructor() {
    this.initializeAiAgentOptions();
    effect(() => {
      this.editedTranscript.set(this.transcript());
    });
  }

  initializeAiAgentOptions() {
    const handle = (agent: EnumAIAgent): { priority: number; value: EnumAIAgent } => {
      switch (agent) {
        case EnumAIAgent.OPEN_ROUTER:
          return { priority: 1, value: EnumAIAgent.OPEN_ROUTER };
        case EnumAIAgent.THAI_LLM:
          return { priority: 2, value: EnumAIAgent.THAI_LLM };
        case EnumAIAgent.GERMINI:
          return { priority: 3, value: EnumAIAgent.GERMINI };
        default:
          return { priority: 99, value: agent };
      }
    };
    this.aiAgentOptions = Object.values(EnumAIAgent)
      .filter((agent) => agent !== EnumAIAgent.MANUAL)
      .map((agent) => handle(agent))
      .sort((a, b) => (a?.priority || 0) - (b?.priority || 0));
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

    this.confirm.emit({
      action,
      subject: this.editedSubject(),
      content: this.editedTranscript(),
      selectedAI: {
        agent: this.selectedAIAgent(),
        model: this.selectedAIModel(),
      },
    });
  }

  onModelChanges(event: Event, type: 'agent' | 'model') {
    const selectElement = event.target as HTMLSelectElement;
    if (type === 'agent') {
      this.selectedAIAgent.set(selectElement.value as EnumAIAgent);
    } else if (type === 'model') {
      this.selectedAIModel.set(selectElement.value as EnumAIModel);
    }
  }
}
