import { MessaggioDTO } from "./messaggio_dto.ts";

export interface RispostaMessaggio extends MessaggioDTO {
  id: number;
  mittente: string; // required
  contenuto: string;
  chat_id: number;
  id_utente: number;
}
