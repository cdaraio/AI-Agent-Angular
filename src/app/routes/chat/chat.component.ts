import { Component, ViewChild, ElementRef, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/dao/dao_auth.service';
import { ApiService } from '../../service/dao/dao_chat_service';
import { catchError, lastValueFrom } from 'rxjs';
import { MessaggiService } from '../../service/messaggi.service';
import { Messaggio } from '../../model/messaggio';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  messages = signal<Messaggio[]>([]);
  userInput = signal('');
  isTyping = signal(false);
  chatId = signal<number | null>(null);
  errorMessage = signal('');
  awaitingSelection = signal<{ type: 'sala' | 'prenotazione' | 'motivazione', items: any[] } | null>(null);

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private messaggi = inject(MessaggiService);

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

    if (!chatId || this.isTyping() || !text) return;

    try {
      if (this.awaitingSelection()) {
        this.errorMessage.set('Seleziona un\'opzione dalle disponibili.');
        setTimeout(() => this.errorMessage.set(''), 3000);
        return;
      }

      this.addUserMessage(text);
      this.userInput.set('');
      this.isTyping.set(true);
      this.scrollToBottom();

      const response = await this.processMessage(text, chatId);
      if (response) {
        this.handleResponse(response);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      this.messaggi.mostraMessaggioErrore("Errore durante l'invio del messaggio");
      this.errorMessage.set('Errore durante l\'invio del messaggio');
      setTimeout(() => this.errorMessage.set(''), 4000);
    } finally {
      this.isTyping.set(false);
      this.scrollToBottom();
    }
  }

  private addUserMessage(text: string) {
    const newMessage: Messaggio = {
      id: Date.now(),
      contenuto: text,
      mittente: 'UTENTE',
      timestamp: new Date(),
      direzione: 'outgoing',
      chat_id: this.chatId() || undefined
    };
    this.messages.update(m => [...m, newMessage]);
  }

  private async processMessage(text: string, chatId: number) {
    const messaggioDTO = {
      contenuto: text,
      chat_id: chatId,
      timestamp: new Date(),
      mittente: 'UTENTE'
    };

    return await lastValueFrom(
      this.apiService.inviaMessaggioChat(chatId, messaggioDTO).pipe(
        catchError(err => {
          this.messaggi.mostraMessaggioErrore('Errore durante l\'invio del messaggio');
          throw err;
        })
      )
    );
  }

  private handleResponse(response: any) {
    const responseOptions = response.options || [];
    let selectionType: 'sala' | 'prenotazione' | 'motivazione' | null = null;

    // Determina il tipo di selezione
    if (responseOptions.length > 0) {
      if (responseOptions[0].hasOwnProperty('id') && responseOptions[0].hasOwnProperty('nome')) {
        selectionType = 'sala';
      }
      else if (responseOptions[0].hasOwnProperty('value') && responseOptions[0].hasOwnProperty('label')) {
        selectionType = 'motivazione';
      }
      else if (responseOptions[0].hasOwnProperty('id') || responseOptions[0].hasOwnProperty('id_prenotazione')) {
        selectionType = 'prenotazione';
      }
    }

    // Imposta lo stato di selezione
    if (selectionType) {
      this.awaitingSelection.set({ type: selectionType, items: responseOptions });
    } else {
      this.awaitingSelection.set(null); // Resetta se non ci sono opzioni
    }

    const newMessage: Messaggio = {
      id: Date.now() + 1,
      contenuto: response.risposta,
      mittente: 'SISTEMA',
      timestamp: new Date(),
      direzione: 'incoming',
      chat_id: this.chatId() || undefined,
      response_options: responseOptions
    };

    this.messages.update(m => [...m, newMessage]);
  }

  selectOption(option: any) {
    const selection = this.awaitingSelection();
    if (!selection) return;

    let message = '';
    let valueToSend = '';

    switch (selection.type) {
      case 'sala':
        message = `Seleziono sala: ${option.nome} (ID: ${option.id})`;
        valueToSend = option.id.toString();
        break;
      case 'prenotazione':
        const id = option.id || option.id_prenotazione;
        message = `Prenotazione con ID ${id}`;
        valueToSend = id.toString();
        break;
      case 'motivazione':
        valueToSend = option.value;
        message = `Seleziono motivazione: ${option.label}`;
        break;
    }
    this.awaitingSelection.set(null);
    this.addUserMessage(message);
    this.scrollToBottom();
    this.sendSelectedValue(valueToSend);
  }

  private async sendSelectedValue(value: string) {
    const chatId = this.chatId();
    if (!chatId) return;

    try {
      this.isTyping.set(true);
      const response = await this.processMessage(value, chatId);
      if (response) {
        this.handleResponse(response);
      }
    } catch (error) {
      console.error('Error sending selected value:', error);
      this.messaggi.mostraMessaggioErrore("Errore durante la selezione");
      this.errorMessage.set('Errore durante la selezione');
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

  private async loadMessages() {
    const chatId = this.chatId();
    if (!chatId) return;

    try {
      const messaggi = await lastValueFrom(
        this.apiService.getMessaggiChat(chatId).pipe(
          catchError(err => {
            this.messaggi.mostraMessaggioErrore('Errore nel caricamento messaggi');
            throw err;
          })
        )
      );
      this.messages.set(messaggi.map(msg => ({
        ...msg,
        direzione: msg.mittente === 'UTENTE' ? 'outgoing' : 'incoming'
      })));
      this.scrollToBottom();
    } catch (error) {
      console.error('Errore nel caricamento messaggi:', error);
    }
  }

  private scrollToBottom() {
    if (this.messagesContainer?.nativeElement) {
      setTimeout(() => {
        const el = this.messagesContainer.nativeElement;
        el.scrollTo({
          top: el.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }

  formatMessage(message: string): string {
    if (!message) return '';
    return message
      .replace(/\$(\d+)/g, '<code class="rounded bg-gray-200 px-1">$1</code>')
      .replace(/\n/g, '<br />');
  }

  trackById(index: number, message: Messaggio) {
    return message.id;
  }
}
