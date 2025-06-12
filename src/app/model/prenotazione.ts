import { MotivazioneEnum } from "./enums/motivazione_enum";

export interface Prenotazione {
    motivazione: MotivazioneEnum;
    id?: number;
    data_ora_inizio: Date | string;
    data_ora_fine: Date | string;
    id_sala: number;
    id_utente: number | null; // Deve essere null per il backend
}
