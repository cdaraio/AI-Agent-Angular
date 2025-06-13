export interface Sala {
  id: number;
  nome: string;
  numero_posti: number;
  categoria: string; // o il tipo corrispondente a `ECategoriaSala`
  caratteristiche: string;
}
