import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { MessaggiService } from '../service/messaggi.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private messaggiService: MessaggiService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Errore HTTP:', error);

        let errorMessage = 'Errore durante la richiesta';

        // Gestione errori strutturati dal backend
        if (error.error && typeof error.error === 'object') {
          // Caso 1: Errore con dettagli annidati (nuovo formato)
          if (error.error.detail && error.error.detail.message) {
            errorMessage = error.error.detail.message;
          }
          // Caso 2: Errore diretto nel campo 'message'
          else if (error.error.message) {
            errorMessage = error.error.message;
          }
          // Caso 3: Errore nel campo 'detail'
          else if (error.error.detail && typeof error.error.detail === 'string') {
            errorMessage = error.error.detail;
          }
        }
        // Gestione errori in formato stringa
        else if (typeof error.error === 'string') {
          try {
            const parsedError = JSON.parse(error.error);
            if (parsedError.detail && parsedError.detail.message) {
              errorMessage = parsedError.detail.message;
            } else if (parsedError.message) {
              errorMessage = parsedError.message;
            } else if (parsedError.detail) {
              errorMessage = parsedError.detail;
            }
          } catch {
            errorMessage = error.error;
          }
        }
        // Gestione altri casi
        else if (error.message) {
          errorMessage = error.message;
        }

        // Mostra il messaggio all'utente
        this.messaggiService.mostraMessaggioErrore(errorMessage);

        // Propaga l'errore
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
