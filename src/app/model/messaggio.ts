import { MotivazioneEnum } from "./enums/motivazione_enum";
import { Prenotazione } from "./prenotazione";
import { Sala } from "./sala";

export interface Motivazione {
  value: string;  // es. "cambio_orario"
  label: string;  // es. "Cambio orario per impegno sovrapposto"
}

export interface Messaggio {
  id: number;
  contenuto: string;
  mittente: 'UTENTE' | 'SISTEMA';
  timestamp: Date;
  chat_id?: number;
  id_utente?: number;
  direzione?: 'incoming' | 'outgoing';

  // Sostituito con un unico campo per tutte le opzioni di risposta
  response_options?: any[]; // Può contenere sale, prenotazioni o motivazioni
}
