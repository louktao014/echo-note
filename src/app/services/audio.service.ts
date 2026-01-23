import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioService {
  constructor(private http: HttpClient) {}

  transcribe(file: File) {
    const form = new FormData();
    form.append('audio', file);

    return this.http.post<{ transcript: string }>('/api/upload-audio', form);
  }

  speechToText(audioFile: File) {
    const formData = new FormData();
    formData.append('file', audioFile);
    return this.http.post('/api/speech-to-text', formData);
  }

  testAudioService() {
    console.log('testAudioService');
    this.http.get('/api/health').subscribe({
      next: (res) => {
        console.log('NEXT:=>', res);
      },
      error: (err) => {
        console.warn('ERROR:', err);
      },
    });
  }
}
