import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnumAIAgent, EnumAIModel } from '../model/transcript.mode';

@Injectable({ providedIn: 'root' })
export class MeetingService {
  constructor(private http: HttpClient) {}

  generateMoM(chunks: string[], selectedAI: { agent: EnumAIAgent; model: EnumAIModel }) {
    return this.http.post('/api/generate-mom', { chunks, selectedAI });
  }
}
