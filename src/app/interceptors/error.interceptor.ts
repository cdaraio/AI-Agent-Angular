import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse | ErrorEvent) => {
      const standardizedError = standardizeError(error, req.url);
      if (!req.headers.has('X-Silent-Error')) {
        showErrorSnackbar(snackBar, standardizedError);
      }
      handleGlobalRedirects(router, standardizedError);
      return throwError(() => standardizedError);
    })
  );
};

// Standardizza tutti i tipi di errore
function standardizeError(error: any, requestUrl: string): AppError {
  // Errore di rete (backend down, CORS, etc.)
  if (error instanceof ErrorEvent || error?.status === 0) {
    return {
      type: 'NETWORK_ERROR',
      message: 'Connessione al server fallita',
      details: `Verificare che:
        1. Il backend sia raggiungibile
        2. Non ci siano problemi CORS
        3. L'endpoint ${requestUrl} sia corretto`,
      originalError: error
    };
  }

  // Errore HTTP standard
  if (error instanceof HttpErrorResponse) {
    return {
      type: 'HTTP_ERROR',
      status: error.status,
      message: getHttpErrorMessage(error),
      details: error.message,
      originalError: error,
      url: error.url || requestUrl
    };
  }

  // Errore generico non HTTP
  return {
    type: 'UNKNOWN_ERROR',
    message: 'Errore sconosciuto',
    details: error?.message || 'Nessun dettaglio disponibile',
    originalError: error
  };
}

// Mappa gli errori HTTP a messaggi user-friendly
function getHttpErrorMessage(error: HttpErrorResponse): string {
  switch (error.status) {
    case 400: return 'Richiesta non valida';
    case 401: return 'Accesso non autorizzato';
    case 403: return 'Accesso negato';
    case 500: return 'Errore interno del server';
    default: return `Errore ${error.status}`;
  }
}

// Mostra la snackbar con pulsante dettagli
function showErrorSnackbar(snackBar: MatSnackBar, error: AppError): void {
  const snackBarRef = snackBar.open(
    error.message,
    'DETTAGLI',
    {
      duration: 10000,
      panelClass: ['global-error-snackbar'],
      verticalPosition: 'top'
    }
  );

  snackBarRef.onAction().subscribe(() => {
    alert(`${error.details}\n\nURL: ${error.url || 'N/A'}`);
  });
}

// Gestione reindirizzamenti globali
function handleGlobalRedirects(router: Router, error: AppError): void {
  if (error.type === 'HTTP_ERROR') {
    switch (error.status) {
      case 401:
        router.navigate(['/login'], { state: { error } });
        break;
      case 403:
        router.navigate(['/access-denied']);
        break;
      case 503:
        router.navigate(['/maintenance']);
        break;
    }
  }
}

// Tipo per errore standardizzato
interface AppError {
  type: 'NETWORK_ERROR' | 'HTTP_ERROR' | 'UNKNOWN_ERROR';
  message: string;
  details: string;
  status?: number;
  url?: string;
  originalError: any;
}
