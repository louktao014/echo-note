import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabse/supabase.service';
import { ITranscript } from './model/transcript.mode';

@Injectable()
export class TranscriptService {
  constructor(private supabase: SupabaseService) {}

  thaiDateToISO(thaiDate: string) {
    // "24/1/2569 04:47:10"
    const [datePart, timePart] = thaiDate.split(' ');
    const [d, m, y] = datePart.split('/').map(Number);

    const adYear = y - 543;

    return `${adYear}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')} ${timePart}`;
  }

  async saveTranscript(content: ITranscript) {
    const raw = {
      user_id: +content.user_id,
      sub_ject: content.sub_ject,
      content: content.content,
      created_at: this.thaiDateToISO(content.created_at),
      updated_at: this.thaiDateToISO(content.updated_at),
    };
    return this.supabase.getClient().from('transcripts').insert(raw);
  }

  async getTranscripts() {
    return this.supabase.getClient().from('transcripts').select('*');
  }
  async deleteTranscript(id: string) {
    return this.supabase.getClient().from('transcripts').delete().eq('id', id);
  }
}
