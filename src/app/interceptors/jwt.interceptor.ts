import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../service/dao/dao_auth.service';

export const JwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService); // Recupera l'istanza di AuthService
  const token = auth.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  return next(req); // Prosegue con la richiesta modificata
};
