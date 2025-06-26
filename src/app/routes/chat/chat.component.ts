import { Component, ViewChild, ElementRef, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/dao/dao_auth.service';
import { ApiService } from '../../service/dao/dao_chat_service';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, lastValueFrom, throwError } from 'rxjs';
import { MessaggiService } from '../../service/messaggi.service';

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

  // Costanti
  readonly botAvatar = '🤖';

  // Servizi
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private messaggi = inject(MessaggiService);

  constructor(
  ) {
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

    const tempMessageId = Date.now();

    try {
      this.messages.update(m => [...m, {
        id: tempMessageId,
        contenuto: text,
        mittente: 'Utente',
        data_ora: new Date().toISOString(),
        isUser: true,
        status: 'pending'
      }]);

      this.userInput.set('');
      this.isTyping.set(true);
      this.scrollToBottom();

      const messaggioDTO = {
        contenuto: text,
        chat_id: chatId,
        data_ora: new Date(),
        mittente: 'Utente'
      };

      const response = await lastValueFrom(
        this.apiService.inviaMessaggioChat(chatId, messaggioDTO).pipe(
          catchError(err => {
            this.messaggi.mostraMessaggioErrore('Errore durante l\'invio del messaggio');
            throw err; // Rilancia l'errore affinché lastValueFrom lo gestisca correttamente
          })
        )
      );


      if (response && response.risposta) {
        this.messages.update(m => [...m, {
          id: Date.now(),
          contenuto: response.risposta,
          mittente: 'Sistema',
          data_ora: new Date().toISOString(),
          isUser: false,
          status: 'success'
        }]);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      this.messaggi.mostraMessaggioErrore("Errore durante l'invio del messaggio")
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
        catchError(err => {
          return throwError(() => err);
        })
      ))
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
