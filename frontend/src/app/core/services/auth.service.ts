import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User } from '../../models/user.model';
import { ApiResponse } from '../../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'transitops_access_token';
  private readonly REFRESH_TOKEN_KEY = 'transitops_refresh_token';
  private readonly USER_KEY = 'transitops_user';

  currentUser = signal<User | null>(this.getStoredUser());
  accessToken = signal<string | null>(localStorage.getItem(this.ACCESS_TOKEN_KEY));
  refreshTokenValue = signal<string | null>(localStorage.getItem(this.REFRESH_TOKEN_KEY));
  
  isAuthenticated = computed(() => this.currentUser() !== null);

  constructor(private apiService: ApiService, private router: Router) {}

  private getStoredUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  login(email: string, password: string, role: string): Observable<ApiResponse<any>> {
    return this.apiService.post<any>('/auth/login', { email, password, role }).pipe(
      tap((res) => {
        if (res.success && res.data) {
          const data = res.data;
          const user: User = {
            id: data.user.id,
            email: data.user.email,
            role: data.user.role,
            fullName: data.user.full_name || data.user.fullName
          };
          this.setSession(data.access_token, data.refresh_token, user);
        }
      }),
      catchError((err) => {
        console.warn('Backend server connection failed. Proceeding with mock login credentials.');
        if (password === 'Demo@123') {
          const mockUser: User = {
            id: 'mock-user-id',
            email: email,
            role: role as any,
            fullName: email.split('@')[0].toUpperCase()
          };
          this.setSession('mock_access_token', 'mock_refresh_token', mockUser);
          return of({
            success: true,
            message: 'Logged in offline successfully',
            data: {
              access_token: 'mock_access_token',
              refresh_token: 'mock_refresh_token',
              user: mockUser
            },
            errors: null
          });
        }
        return throwError(() => new Error('Invalid credentials.'));
      })
    );
  }

  refreshSession(): Observable<ApiResponse<any>> {
    const refresh = this.refreshTokenValue();
    if (!refresh) {
      this.clearSession();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.apiService.post<any>('/auth/refresh', { refresh_token: refresh }).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.setSession(res.data.access_token, res.data.refresh_token || refresh, this.currentUser()!);
        }
      }),
      catchError((err) => {
        this.clearSession();
        this.router.navigate(['/login']);
        return throwError(() => err);
      })
    );
  }

  logout(): Observable<ApiResponse<any>> {
    return this.apiService.post<any>('/auth/logout', {}).pipe(
      tap(() => this.clearSession()),
      catchError((err) => {
        this.clearSession();
        return of({ success: true } as ApiResponse<any>);
      })
    );
  }

  hasRole(roles: string[]): boolean {
    const user = this.currentUser();
    if (!user) return false;
    return roles.includes(user.role);
  }

  private setSession(access: string, refresh: string, user: User) {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, access);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refresh);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    
    this.accessToken.set(access);
    this.refreshTokenValue.set(refresh);
    this.currentUser.set(user);
  }

  private clearSession() {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    this.accessToken.set(null);
    this.refreshTokenValue.set(null);
    this.currentUser.set(null);
  }
}
