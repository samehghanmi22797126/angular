import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatRequest {
  userId: string;
  userName: string;
  message: string;
}

export interface ChatResponse {
  response: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  // URL CORRECTE - utilisez /api/Chatbot/send, pas /api/Chat
  private apiUrl = 'http://localhost:5280/api/Chatbot';

  constructor(private http: HttpClient) { }

  sendMessage(message: string, userId: string, userName: string): Observable<ChatResponse> {
    const request: ChatRequest = {
      userId: userId,
      userName: userName,
      message: message
    };

    console.log('Envoi du message:', request);
    return this.http.post<ChatResponse>(`${this.apiUrl}/send`, request);
  }

  getHistory(limit: number = 50): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/history?limit=${limit}`);
  }

  healthCheck(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }
}
