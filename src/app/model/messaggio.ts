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
  sale_disponibili?:Sala[];
  prenotazioni_utente?:Prenotazione[];
  motivazioni_disponibili?: { value: MotivazioneEnum; label: string }[];
}
