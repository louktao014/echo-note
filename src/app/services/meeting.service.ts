import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MeetingService {
  constructor(private http: HttpClient) {}

  generateMoM(chunks: string[]) {
    return this.http.post('/api/generate-mom', { chunks });
  }
}
