export enum CategoriaSalaEnum {
  RIUNIONI = "Riunioni",
  CONFERENZE = "Conferenze",
  EVENTI = "Eventi"

}

// Label per UI
export const CategoriaSalaLabels: Record<CategoriaSalaEnum, string> = {
  [CategoriaSalaEnum.RIUNIONI]: "Riunioni",
  [CategoriaSalaEnum.CONFERENZE]: "Conferenze",
  [CategoriaSalaEnum.EVENTI]: "Eventi",
};

// Array per select
export const CategoriaSala = Object.values(CategoriaSalaEnum).map(value => ({
  value,
  label: CategoriaSalaLabels[value],
}));
