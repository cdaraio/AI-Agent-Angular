import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ApiService } from '../../service/dao/dao_chat_service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChatResolver implements Resolve<any> {
  constructor(private apiService: ApiService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const chatId = route.paramMap.get('id');
    if (chatId) {
      return this.apiService.getMessages(Number(chatId)).pipe(
        catchError(() => of([])) // Gestione fallback in caso di errore
      );
    }
    return of([]); // Restituisce un array vuoto se non c'è chatId
  }
}
