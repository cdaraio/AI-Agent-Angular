import { CategoriaSalaEnum } from "./enums/categoria_sala_enum";

export interface Sala {
  id: number;
  nome: string;
  numero_posti: number;
  categoria: CategoriaSalaEnum;
  caratteristiche: string;
}
