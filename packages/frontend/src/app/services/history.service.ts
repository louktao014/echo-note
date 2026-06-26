import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private history = signal<string[]>([]);

  getHistory() {
    return this.history.asReadonly();
  }

  addToHistory(item: string) {
    this.history.update(history => [...history, item]);
  }

  removeFromHistory(item: string) {
    this.history.update(history => history.filter(h => h !== item));
  }
}
