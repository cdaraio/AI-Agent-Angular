import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, catchError } from 'rxjs';
import { UtentiService } from '../dao/dao_utenti.service';

@Injectable({ providedIn: 'root' })
export class UtentiResolver implements Resolve<any[]> {
  constructor(private utentiService: UtentiService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any[]> {
    return this.utentiService.getUtenti().pipe(
      catchError(error => {
        console.error('Resolver Error:', error);
        throw new Error('Failed to load users data');
      })
    );
  }
}
