import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Exclude login and refresh to avoid recursive loops
      const isAuthRequest = req.url.includes('/auth/login') || req.url.includes('/auth/refresh');

      if ((error.status === 401 || error.status === 403) && !isAuthRequest) {
        return authService.refreshSession().pipe(
          switchMap((res) => {
            const newToken = res.data.access_token;
            const newReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            return next(newReq);
          }),
          catchError((err) => {
            return throwError(() => err);
          })
        );
      }

      // Handle envelope error formats
      let errors = null;
      if (error.error && error.error.errors) {
        errors = error.error.errors;
      } else {
        errors = [{
          field: 'general',
          message: error.error?.message || error.message || 'An unexpected error occurred'
        }];
      }

      const formattedError = {
        status: error.status,
        message: error.error?.message || 'Server error',
        errors: errors
      };

      return throwError(() => formattedError);
    })
  );
};
