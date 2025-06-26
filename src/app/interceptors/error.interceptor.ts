import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { MessaggiService } from '../service/messaggi.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor() { }

  private messaggi = Inject(MessaggiService)

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Errore HTTP:', error);

        let errorMessage = 'Errore durante la richiesta';

        if (error.error instanceof ErrorEvent) {
          // Errore lato client
          errorMessage = `Errore: ${error.error.message}`;
        } else {
          // Errore lato server
          if (typeof error.error === 'string') {
            try {
              const parsedError = JSON.parse(error.error);
              errorMessage = parsedError.message || parsedError.error || error.statusText;
            } catch {
              errorMessage = error.error;
            }
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          } else {
            errorMessage = error.message || error.statusText;
          }
        }

        // Mostra il messaggio all'utente
        this.messaggi.mostraMessaggioErrore(errorMessage);

        // Propaga l'errore
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
