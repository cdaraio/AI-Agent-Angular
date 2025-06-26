import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { MessaggioDTO } from '../../model/dto/messaggio_dto';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.backendUrl;

  constructor(private http: HttpClient) { }

  createNewChat(): Observable<{ chat_id: number }> {
    return this.http.post<{ chat_id: number }>(`${this.baseUrl}/chats/new`, {});
  }

  inviaMessaggioChat(chatId: number, messaggio: MessaggioDTO): Observable<any> {
    return this.http.post(`${this.baseUrl}/chats/${chatId}/messaggi`, messaggio);
  }

  getMessaggiChat(chatId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/chats/${chatId}/messaggi`);
  }

  getMessages(chatId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/chats/${chatId}/messaggi`).pipe(
    catchError(error => {
      return throwError(() => error);
    })
  );
}

  sendMessage(chatId: number, messaggio: { contenuto: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/chats/${chatId}/messaggi`, messaggio);
  }
}
