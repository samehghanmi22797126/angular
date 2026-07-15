import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ChatService {
  messages$ = new Subject<string>();
  private ws?: WebSocket;

  constructor(private http: HttpClient) {}

  // Envoi HTTP (si vous utilisez HTTP)
  sendMessageHttp(text: string): Observable<any> {
    console.log('[ChatService] sendMessageHttp', text);
    return this.http.post('/api/chat/send', { message: text }).pipe(
      tap({
        next: (res) => {
          console.log('[ChatService] HTTP réponse:', res);
        },
        error: (err) => {
          console.error('[ChatService] HTTP erreur:', err);
        }
      })
    );
  }

  // Connexion WebSocket (si vous utilisez WS)
  connectWebSocket(url: string) {
    console.log('[ChatService] connectWebSocket', url);
    this.ws = new WebSocket(url);

    this.ws.onopen = () => console.log('[ChatService] WS ouvert');
    this.ws.onmessage = (ev) => {
      console.log('[ChatService] WS message reçu:', ev.data);
      this.messages$.next(ev.data);
    };
    this.ws.onerror = (ev) => console.error('[ChatService] WS erreur:', ev);
    this.ws.onclose = (ev) => console.log('[ChatService] WS fermé', ev.code, ev.reason);
  }

  sendWebSocketMessage(text: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[ChatService] WS non connecté');
      return;
    }
    console.log('[ChatService] WS envoi:', text);
    this.ws.send(text);
  }

  disconnectWebSocket() {
    this.ws?.close();
  }
}