import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class AudioService {
  constructor(private http: HttpClient) {}

  transcribe(file: File) {
    const form = new FormData();
    form.append('audio', file);

    return this.http.post<{ transcript: string }>(
      '/api/audio/transcribe',
      form
    );
  }
}
