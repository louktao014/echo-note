import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-mom-result',
  templateUrl: './mom-result.component.html',
  styleUrls: ['./mom-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class MomResultComponent {
  mom = input<{
    summary: string[];
    resolutions: string[];
    actionItems: any[];
    others: string[];
  }>();
}
