export enum MotivazioneEnum {
  CAMBIO_ORARIO = 'cambio_orario',
  URGENZA_PERSONALE = 'urgenza_personale',
  RIPROGRAMMAZIONE_EVENTO = 'riprogrammazione_evento',
  ERRORI_PRECEDENTI = 'errori_precedenti',
}

// Label per UI con descrizioni più dettagliate
export const MotivazioniUpdateLabels: Record<MotivazioneEnum, string> = {
  [MotivazioneEnum.CAMBIO_ORARIO]: 'Cambio orario per impegno sovrapposto',
  [MotivazioneEnum.URGENZA_PERSONALE]: 'Urgenza personale',
  [MotivazioneEnum.RIPROGRAMMAZIONE_EVENTO]: 'Riprogrammazione evento',
  [MotivazioneEnum.ERRORI_PRECEDENTI]: 'Correzione di errore nella prenotazione',
};

// Array per select
export const MotivazioniUpdate = Object.values(MotivazioneEnum).map(value => ({
  value,
  label: MotivazioniUpdateLabels[value],
}));
