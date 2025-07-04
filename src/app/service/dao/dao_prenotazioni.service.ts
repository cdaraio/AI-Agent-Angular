import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Prenotazione } from '../../model/prenotazione';
import { DeletePrenotazioneDTO } from '../../model/dto/delete_prenotazione_dto';

@Injectable({
  providedIn: 'root'
})
export class PrenotazioniService {
  private apiUrl = `${environment.backendUrl}/admin/prenotazioni`;

  constructor(private http: HttpClient) { }

  getPrenotazioni(): Observable<Prenotazione[]> {
    return this.http.get<Prenotazione[]>(this.apiUrl);
  }

  getPrenotazioneById(id: number): Observable<Prenotazione> {
  return this.http.get<Prenotazione[]>(`${this.apiUrl}?id=${id}`).pipe(
    map(prenotazioni => {
      const prenotazione = prenotazioni.find(p => p.id === id);
      if (!prenotazione) {
        throw new Error(`Prenotazione con ID ${id} non trovata`);
      }
      return prenotazione;
    }),
    catchError(error => {
      console.error('Errore durante il recupero della prenotazione:', error);
      return throwError(() => new Error('Errore durante il recupero della prenotazione'));
    })
  );
}

  createPrenotazione(prenotazione: Prenotazione): Observable<Prenotazione> {
    return this.http.post<Prenotazione>(this.apiUrl, prenotazione);
  }

  updatePrenotazione(id: number, prenotazione: Prenotazione): Observable<Prenotazione> {
    return this.http.put<Prenotazione>(`${this.apiUrl}/${id}`, prenotazione);
  }

  modificaPrenotazione(idPrenotazione: number, prenotazione: Prenotazione): Observable<any> {
    const datiDaInviare = {
      ...prenotazione,
      id: idPrenotazione,
      id_utente: null // Imposta id_utente a null come richiesto dal backend
    };

    return this.http.put(`${this.apiUrl}/${idPrenotazione}`, datiDaInviare);
  }

  getPrenotazioniRecenti(): Observable<Prenotazione[]> {
    return this.http.get<Prenotazione[]>(`${environment.backendUrl}/prenotazioni/recenti`).pipe(
      map(prenotazioni =>
        prenotazioni.map(p => ({
          ...p,
          data_ora_inizio: new Date(p.data_ora_inizio),
          data_ora_fine: new Date(p.data_ora_fine),
          data_modifica: p.data_modifica ? new Date(p.data_modifica) : null
        }))
      )
    );
  }

  deletePrenotazione(id: number, dto: DeletePrenotazioneDTO): Observable<{ message: string, motivazione: string }> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<{ message: string, motivazione: string }>(url, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      body: dto
    });
  }
}
