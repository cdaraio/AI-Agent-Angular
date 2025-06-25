import { MessaggioDTO } from "./messaggio_dto";

export interface RispostaMessaggio extends MessaggioDTO {
  id: number;
  mittente: string; // required
  contenuto: string;
  chat_id: number;
  id_utente: number;
}
