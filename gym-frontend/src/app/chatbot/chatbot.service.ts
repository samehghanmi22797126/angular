import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private apiUrl = 'http://localhost:5280/api/chat';

  constructor(private http: HttpClient) { }

  sendMessage(message: string, history: ChatMessage[]): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.apiUrl, { message, history });
  }
}
