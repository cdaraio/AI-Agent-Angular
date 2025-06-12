import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Prenotazione } from '../../model/prenotazione';
import { MotivazioneDeleteEnum } from '../../model/enums/motivazione_delete_enum';
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
    return this.http.get<Prenotazione[]>(`${this.apiUrl}?id=${id}`)
      .pipe(
        map(prenotazioni => {
          if (prenotazioni.length === 0) {
            throw new Error('Prenotazione non trovata');
          }
          return prenotazioni[0];
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

  deletePrenotazione(id: number, dto: DeletePrenotazioneDTO): Observable<{message: string, motivazione: string}> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<{message: string, motivazione: string}>(url, {
        headers: new HttpHeaders({'Content-Type': 'application/json'}),
        body: dto
    });
}
}
