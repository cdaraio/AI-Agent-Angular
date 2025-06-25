export interface Messaggio {
  id: number;
  contenuto: string;
  mittente: 'user' | 'bot' | 'sistema';
  timestamp: Date;
  chat_id?: number;
  id_utente?: number;
  direzione?: 'incoming' | 'outgoing'
}
