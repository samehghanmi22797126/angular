import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ChatbotService } from './chatbot.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit {

  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  messages: { text: string, fromBot: boolean, timestamp: Date }[] = [];
  newMessage: string = '';
  isLoading: boolean = false;

  userId: string = '';
  userName: string = '';

  // 🔥 NOUVEAU
  chatOpen: boolean = false;
  unreadCount: number = 0;

  constructor(
    private chatbotService: ChatbotService,
    private authService: AuthService
  ) { }

  /**
   * Méthode du cycle de vie Angular appelée à l'initialisation du composant.
   * Récupère l'utilisateur connecté pour personnaliser la discussion, affiche le message initial du bot,
   * et configure un rappel de simulation de notification d'inactivité (unreadCount) après 3 secondes si le chat est fermé.
   */
  ngOnInit(): void {
    const user = this.authService.getCurrentUser();

    if (user) {
      this.userId = user.id.toString();
      this.userName = user.name;
    } else {
      this.userId = 'guest';
      this.userName = 'Invité';
    }

    // message initial
    this.messages.push({
      text: '👋 Bonjour ! Je suis votre assistant.',
      fromBot: true,
      timestamp: new Date()
    });

    // notification si fermé
    setTimeout(() => {
      if (!this.chatOpen) {
        this.unreadCount++;
      }
    }, 3000);
  }

  /**
   * Bascule l'état d'ouverture/fermeture de la boîte de discussion du chatbot.
   * Si elle est ouverte, réinitialise le compteur de messages non lus et fait défiler la discussion vers le bas.
   */
  toggleChat(): void {
    this.chatOpen = !this.chatOpen;

    if (this.chatOpen) {
      this.unreadCount = 0;
      this.scrollToBottom();
    }
  }

  /**
   * Envoie le message texte saisi par l'utilisateur au serveur chatbot (via ChatbotService).
   * Ajoute le message localement, gère l'état de chargement visuel, effectue l'appel API,
   * et ajoute la réponse du chatbot (ou une erreur en cas d'échec) tout en ajustant le compteur
   * d'inactivité unreadCount si la fenêtre est actuellement fermée.
   */
  sendMessage(): void {
    if (!this.newMessage.trim()) return;

    this.messages.push({
      text: this.newMessage,
      fromBot: false,
      timestamp: new Date()
    });

    const messageToSend = this.newMessage;
    this.newMessage = '';
    this.isLoading = true;

    this.scrollToBottom();

    this.chatbotService.sendMessage(messageToSend, this.userId, this.userName).subscribe({
      next: (response) => {
        this.messages.push({
          text: response.response,
          fromBot: true,
          timestamp: new Date()
        });

        // 🔴 notif si fermé
        if (!this.chatOpen) {
          this.unreadCount++;
        }

        this.isLoading = false;
        this.scrollToBottom();
      },
      error: () => {
        this.messages.push({
          text: '❌ Erreur serveur',
          fromBot: true,
          timestamp: new Date()
        });

        if (!this.chatOpen) {
          this.unreadCount++;
        }

        this.isLoading = false;
        this.scrollToBottom();
      }
    });
  }

  /**
   * Fait défiler le conteneur HTML des messages de discussion tout en bas.
   * Ajoute un délai de 100 millisecondes pour laisser le temps au DOM de se mettre à jour avec les nouveaux messages.
   */
  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messageContainer) {
        this.messageContainer.nativeElement.scrollTop =
          this.messageContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
}
