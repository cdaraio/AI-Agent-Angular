export class Utente {
  public id?: number;

  constructor(
    public readonly email: string,
    public readonly authToken: string,
    public readonly nome?: string,
    public readonly cognome?: string,
    public readonly ruolo?: string
  ) {}
}
