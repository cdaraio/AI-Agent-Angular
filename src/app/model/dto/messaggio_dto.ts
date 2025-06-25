export class MessaggioDTO {
  contenuto: string;
  chat_id: number;
  data_ora?: Date;
  mittente?: string;

  constructor(contenuto: string, chat_id: number, data_ora?: Date, mittente?: string) {
    this.contenuto = contenuto;
    this.chat_id = chat_id;
    this.data_ora = data_ora;
    this.mittente = mittente;
  }
}
