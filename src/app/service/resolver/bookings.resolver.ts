import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, catchError, throwError } from 'rxjs';
import { PrenotazioniService } from '../dao/dao_prenotazioni.service';
import { Prenotazione } from '../../model/prenotazione';

@Injectable({ providedIn: 'root' })
export class BookingResolver implements Resolve<Prenotazione[]> {
  constructor(
    private prenotazioniService: PrenotazioniService,
    private router: Router
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<Prenotazione[]> {
    return this.prenotazioniService.getPrenotazioni().pipe(
      catchError((error) => {
        console.error('BookingResolver Error:', error);
        this.router.navigate(['/error'], {
          state: {
            error: 'LOAD_BOOKINGS_FAILED',
            message: 'Impossibile caricare le prenotazioni',
            status: error.status || 500
          },
          replaceUrl: true
        });
        return EMPTY;
      })
    );
  }
}
