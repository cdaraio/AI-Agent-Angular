import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Errore sconosciuto!';

      if (error.error instanceof ErrorEvent) {
        // Errore lato client o di rete
        errorMessage = `Errore: ${error.error.message}`;
        // notificationService.showError('Errore di rete o client!');
      } else {
        // Errore lato server
        switch (error.status) {
          case 401: // Non autorizzato
            errorMessage = 'Non autorizzato. Effettua il login.';
            router.navigate(['/login']); // Reindirizza alla pagina di login
            // notificationService.showError('Sessione scaduta o non autorizzata!');
            break;
          case 403: // Proibito
            errorMessage = 'Non hai i permessi per accedere a questa risorsa.';
            router.navigate(['/forbidden']); // O una pagina di accesso negato
            // notificationService.showError('Accesso negato!');
            break;
          case 404: // Non trovato
            errorMessage = `Risorsa non trovata: ${error.url}`;
            // notificationService.showError('Risorsa non trovata!');
            break;
          case 500: // Errore interno del server
            errorMessage = `Errore server: ${error.status} - ${error.message}`;
            // notificationService.showError('Errore interno del server!');
            break;
          default:
            errorMessage = `Codice errore: ${error.status}\nMessaggio: ${error.message}`;
            // notificationService.showError('Si è verificato un errore!');
            break;
        }
      }
      console.error(errorMessage);
      return throwError(() => new Error(errorMessage)); // Rilancia l'errore per essere gestito a valle
    })
  );
};
