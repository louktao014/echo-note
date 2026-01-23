import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TranscriptService {
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
}
