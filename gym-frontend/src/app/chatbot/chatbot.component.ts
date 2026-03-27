import { Component } from '@angular/core';
import { ChatbotService, ChatMessage } from './chatbot.service';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent {
  messages: ChatMessage[] = [];
  userInput = '';
  isLoading = false;
  isOpen = false;

  constructor(private chatbotService: ChatbotService) { }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
  }

  sendMessage(): void {
    if (!this.userInput.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: this.userInput };
    this.messages.push(userMsg);
    this.isLoading = true;

    this.chatbotService.sendMessage(this.userInput, this.messages).subscribe({
      next: (res: { message: string }) => {
        this.messages.push({ role: 'assistant', content: res.message });
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });

    this.userInput = '';
  }
}
