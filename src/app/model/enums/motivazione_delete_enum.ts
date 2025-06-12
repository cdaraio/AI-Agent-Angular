export enum MotivazioneDeleteEnum {
  CAMBIO_ORARIO = "cambio_orario",
  URGENZA_PERSONALE = "urgenza_personale",
  RIPROGRAMMAZIONE_EVENTO = "riprogrammazione_evento",
  ERRORI_PRECEDENTI = "errori_precedenti",
}

// Label per UI (con testo formattato)
export const MotivazioniDeleteLabels: Record<MotivazioneDeleteEnum, string> = {
  [MotivazioneDeleteEnum.CAMBIO_ORARIO]: "Cambio orario",
  [MotivazioneDeleteEnum.URGENZA_PERSONALE]: "Urgenza personale",
  [MotivazioneDeleteEnum.RIPROGRAMMAZIONE_EVENTO]: "Riprogrammazione evento",
  [MotivazioneDeleteEnum.ERRORI_PRECEDENTI]: "Correzione errore prenotazione",
};

// Array per select
export const MotivazioniDelete = Object.values(MotivazioneDeleteEnum).map(value => ({
  value,
  label: MotivazioniDeleteLabels[value],
}));
