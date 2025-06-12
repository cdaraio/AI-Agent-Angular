import { MotivazioneDeleteEnum } from "../enums/motivazione_delete_enum";

export interface DeletePrenotazioneDTO {
  motivazione: MotivazioneDeleteEnum;
  note_aggiuntive?: string;
}
