import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Sala } from '../../model/sala';

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private apiUrl = `${environment.backendUrl}/sale`;

  constructor(private http: HttpClient) {}

  // Recupera tutte le sale
  getSale(): Observable<Sala[]> {
    return this.http.get<Sala[]>(this.apiUrl);
  }

  // Recupera una sala per ID
  getSalaById(id: number): Observable<Sala> {
    return this.http.get<Sala>(`${this.apiUrl}/${id}`);
  }

  // Crea una nuova sala
  createSala(sala: Sala): Observable<Sala> {
    return this.http.post<Sala>(this.apiUrl, sala);
  }

  // Aggiorna una sala esistente
  updateSala(id: number, sala: Sala): Observable<Sala> {
    return this.http.put<Sala>(`${this.apiUrl}/${id}`, sala);
  }

  // Elimina una sala
  deleteSala(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
