import { Injectable } from '@angular/core';
import { ITranscript } from '../model/transcript.mode';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class TranscriptService {
  constructor(private http: HttpClient) {}

  chunk(text: string): string[] {
    const maxLength = 3000;
    const chunks: string[] = [];

    let start = 0;

    while (start < text.length) {
      let end = start + maxLength;

      // ถ้าเกินความยาว text ก็เอาทั้งหมดที่เหลือ
      if (end >= text.length) {
        chunks.push(text.slice(start));
        break;
      }

      // ถ้าตำแหน่ง end ไม่ใช่ space → เดินต่อจนกว่าจะเจอ space
      while (end < text.length && text[end] !== ' ') {
        end++;
      }

      chunks.push(text.slice(start, end));
      start = end + 1; // ข้าม space
    }

    return chunks;
  }

  saveTranscript(payload: ITranscript) {
    return this.http.post('/api/save-transcript', payload);
  }

  getAllTranscript() {
    return this.http.get('/api/get-transcript');
  }
  deleteTranscript(id: string) {
    return this.http.delete(`/api/delete-transcript/${id}`);
  }
}
