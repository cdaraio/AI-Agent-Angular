import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../service/dao/dao_chat_service';
import { MessaggiService } from '../messaggi.service';

@Injectable({
  providedIn: 'root'
})
export class ChatResolver implements Resolve<any> {
  constructor(
    private apiService: ApiService,
    private messaggiService: MessaggiService,
    private router: Router
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const chatId = route.paramMap.get('id');
    if (!chatId) {
      this.handleError('ID chat non valido');
      return of([]);
    }

    return this.apiService.getMessages(Number(chatId)).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Errore durante il caricamento dei messaggi';

        // Estrazione messaggio d'errore personalizzata
        if (error.status === 500) {
          errorMessage = this.extractErrorMessage(error);
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }

        this.handleError(errorMessage);
        return of([]);
      })
    );
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    try {
      // Gestione specifica per traceback Python
      if (typeof error.error === 'string' && error.error.includes('DAOException')) {
        const match = error.error.match(/DAOException: (.+?)(?:'|$)/);
        return match ? match[1] : 'Risorsa non trovata';
      }

      // Tentativo di parsing JSON
      const parsed = typeof error.error === 'string' ? JSON.parse(error.error) : error.error;
      return parsed.error || parsed.message || 'Errore del server';
    } catch {
      return error.message || 'Errore sconosciuto';
    }
  }

  private handleError(message: string): void {
    this.messaggiService.mostraMessaggioErrore(message);
    this.router.navigate(['/login']); // Assicurati che il percorso sia corretto
  }
}
