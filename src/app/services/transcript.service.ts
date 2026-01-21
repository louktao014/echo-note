import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class TranscriptService {
  chunk(text: string): string[] {
    const maxLength = 3000;
    const chunks = [];

    for (let i = 0; i < text.length; i += maxLength) {
      chunks.push(text.slice(i, i + maxLength));
    }

    return chunks;
  }
}
