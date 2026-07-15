import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ChatService {
  messages$ = new Subject<string>();
  private ws?: WebSocket;

  constructor(private http: HttpClient) {}

  /**
   * Envoie un message texte au chatbot via le protocole standard HTTP.
   * Utilise l'opérateur tap pour journaliser les réponses ou les erreurs de manière asynchrone.
   * @param text Le message textuel saisi par l'utilisateur.
   * @returns Un Observable représentant la réponse du chatbot.
   */
  sendMessageHttp(text: string) {
    return this.http.post('/api/chat/send', { message: text }).pipe(
      tap({
        next: (res) => console.log('HTTP réponse chatbot:', res),
        error: (err) => console.error('HTTP erreur chatbot:', err)
      })
    );
  }

  /**
   * Établit une connexion temps réel persistante par protocole WebSocket avec le serveur.
   * Configure les écouteurs d'événements pour la réception des messages, la gestion des erreurs et la déconnexion.
   * @param url L'adresse URL complète du serveur WebSocket (ex: ws://localhost:5280/ws).
   */
  connectWebSocket(url: string) {
    this.ws = new WebSocket(url);
    this.ws.onopen = () => console.log('WS ouvert');
    this.ws.onmessage = (ev) => {
      console.log('WS message reçu:', ev.data);
      this.messages$.next(ev.data);
    };
    this.ws.onerror = (ev) => console.error('WS erreur:', ev);
    this.ws.onclose = (ev) => console.log('WS fermé', ev.code, ev.reason);
  }

  /**
   * Ferme proprement la connexion WebSocket active avec le serveur si elle existe.
   */
  disconnectWebSocket() {
    this.ws?.close();
  }
}   
