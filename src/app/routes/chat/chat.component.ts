// chat.component.ts
import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

interface RoomData {
  id: string;
  name: string;
  capacity: number;
  equipment: string;
  status: string;
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  time: Date;
  animation: string;
  data?: {
    rooms?: RoomData[];
    map?: string;
  };
}

@Component({
  standalone: true,
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  imports: [FormsModule,
    CommonModule
  ],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('hologramAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class ChatComponent implements AfterViewInit {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  messages: ChatMessage[] = [
    {
      sender: 'ai',
      text: 'Sono l\'agente di prenotazione, il tuo assistente AI per prenotazioni delle sale. Come posso aiutarti?',
      time: new Date(),
      animation: 'fadeIn'
    }
  ];

  userInput = '';
  isProcessing = false;
  showHologram = true;
  activeRoomType = 'Conference';

  ngAfterViewInit() {
    setTimeout(() => {
      this.showHologram = false;
    }, 2000);
    this.scrollToBottom();
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: this.userInput,
      time: new Date(),
      animation: 'fadeInUp'
    };

    this.messages.push(userMsg);
    this.userInput = '';
    this.isProcessing = true;
    this.scrollToBottom();

    setTimeout(() => {
      this.generateAIResponse(userMsg.text);
      this.isProcessing = false;
      this.scrollToBottom();
    }, 1000 + Math.random() * 2000);
  }

  private generateAIResponse(query: string) {
    const responses = [
      {
        text: `Ho trovato 3 ${this.activeRoomType} rooms disponibili. Vuoi vedere i dettagli?`,
        data: {
          rooms: this.generateRoomData()
        }
      },
      {
        text: `Posso prenotare la sala per te. Confermi data e orario?`,
        data: undefined
      },
      {
        text: `Ecco la mappa 3D della sala selezionata con le configurazioni possibili.`,
        data: {
          map: '3d-sala-' + Math.floor(Math.random() * 5 + 1)
        }
      }
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];

    const aiMsg: ChatMessage = {
      sender: 'ai',
      text: response.text,
      time: new Date(),
      animation: 'fadeIn',
      data: response.data
    };

    this.messages.push(aiMsg);
  }

  private generateRoomData(): RoomData[] {
    return Array(3).fill(0).map((_, i) => ({
      id: `RM-${Math.floor(1000 + Math.random() * 9000)}`,
      name: `${this.activeRoomType} ${i+1}`,
      capacity: [10, 20, 30][i],
      equipment: ['Schermo 4K', 'Audio Dolby', 'VR Ready'][i],
      status: 'Disponibile'
    }));
  }

  private scrollToBottom() {
    setTimeout(() => {
      this.chatContainer.nativeElement.scrollTop =
        this.chatContainer.nativeElement.scrollHeight;
    }, 100);
  }
}
