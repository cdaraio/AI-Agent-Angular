import { Component, ViewChild, ElementRef, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/dao/dao_auth.service';
import { ApiService } from '../../service/dao/dao_chat_service';
import { toSignal } from '@angular/core/rxjs-interop';
import { tap, catchError, of, lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  // Signals
  messages = signal<any[]>([]);
  userInput = signal('');
  isTyping = signal(false);
  chatId = signal<number | null>(null);
  errorMessage = signal('');
  logoPath = '/assets/images/logo.png';

  // Costanti
  readonly botAvatar = '🤖';

  // servizi
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  constructor() {
    this.route.paramMap.subscribe(params => {
      const chatId = params.get('id');
      if (chatId) {
        this.chatId.set(Number(chatId));
        this.loadMessages();
      }
    });
  }

  async sendMessage() {
    const text = this.userInput().trim();
    const chatId = this.chatId();

    if (!text || !chatId || this.isTyping()) return;

    // Crea un ID temporaneo per il messaggio utente
    const tempMessageId = Date.now();

    try {
      // Aggiungi subito il messaggio utente alla UI
      this.messages.update(m => [...m, {
        id: tempMessageId,
        contenuto: text,
        mittente: 'Utente',
        data_ora: new Date().toISOString(),
        isUser: true
      }]);

      this.userInput.set('');
      this.isTyping.set(true);
      this.scrollToBottom();

      // Prepara il DTO per il backend
      const messaggioDTO = {
        contenuto: text,
        chat_id: chatId,  // Assicurati che questo campo corrisponda al tuo backend
        data_ora: new Date(),
        mittente: 'Utente'  // Aggiungi se necessario
      };

      // Invia al backend
      const response = await lastValueFrom(
        this.apiService.inviaMessaggioChat(chatId, messaggioDTO).pipe(
          catchError(error => {
            // Rimuove il messaggio temporaneo in caso di errore
            this.messages.update(m => m.filter(msg => msg.id !== tempMessageId));
            throw error;
          })
        )
      );

      // Aggiungi la risposta del bot solo se valida
      if (response && response.risposta) {
        this.messages.update(m => [...m, {
          id: Date.now(), // Nuovo ID per il messaggio del bot
          contenuto: response.risposta,
          mittente: 'Sistema',
          data_ora: new Date().toISOString(),
          isUser: false
        }]);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      this.errorMessage.set('Errore durante l\'invio del messaggio');
      setTimeout(() => this.errorMessage.set(''), 4000);
    } finally {
      this.isTyping.set(false);
      this.scrollToBottom();
    }
}

  updateInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.userInput.set(input.value);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private loadMessages() {
    const chatId = this.chatId();
    if (!chatId) return;

    toSignal(
      this.apiService.getMessaggiChat(chatId).pipe(
        tap(messages => {
          this.messages.set(messages.map(msg => ({
            ...msg,
            isUser: msg.mittente === 'Utente'
          })));
          setTimeout(() => this.scrollToBottom(), 100);
        }),
        catchError(error => {
          console.error('Error loading messages:', error);
          this.errorMessage.set('Errore nel caricamento della chat');
          setTimeout(() => this.errorMessage.set(''), 4000);
          return of([]);
        })
      )
    )();
  }

  private scrollToBottom() {
    if (this.messagesContainer?.nativeElement) {
      setTimeout(() => {
        this.messagesContainer.nativeElement.scrollTo({
          top: this.messagesContainer.nativeElement.scrollHeight,
          behavior: 'smooth'
        });
      }, 0);
    }
  }

  formatMessage(message: string): string {
    if (!message) return '';
    return message
      .replace(/\$(\d+)/g, '<code class="rounded bg-gray-200 px-1">$1</code>')
      .replace(/\n/g, '<br />');
  }
}
