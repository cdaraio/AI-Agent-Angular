import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Utente } from '../../model/utente';

@Injectable({
  providedIn: 'root'
})
export class UtentiService {
  private apiUrl = `${environment.backendUrl}/utenti`;

  constructor(private http: HttpClient) { }

  getUtenti(): Observable<Utente[]> {
    return this.http.get<Utente[]>(this.apiUrl);
  }

  getUtente(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  creaUtente(utente: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, utente);
  }

  aggiornaUtente(id: number, utente: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, utente);
  }

  eliminaUtente(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
