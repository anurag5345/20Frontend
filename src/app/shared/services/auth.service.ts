import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { tap, map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastService } from '../ui/toast.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = `${environment.apiUrl}/auth`;
  private tokenKey = 'ims_token';
  private suppressUnauthorized = false;

  constructor(private http: HttpClient, private toast: ToastService) {}

  register(payload: any) {
    return this.http.post<any>(`${this.api}/register`, payload).pipe(
      map((res) => res.data),
      catchError((err) => this.handleError(err))
    );
  }

  login(email: string, password: string) {
    return this.http.post<any>(`${this.api}/login`, { email, password }).pipe(
      map((res) => res.data),
      tap((res) => {
        if (res?.token) {
          this.saveToken(res.token);
        }
      }),
      catchError((err) => this.handleError(err))
    );
  }

  private saveToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn() {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.suppressUnauthorized = true;
    setTimeout(() => (this.suppressUnauthorized = false), 800);
    location.assign('/login');
  }

  private handleError(err: any) {
    const backend = err?.error ?? err;
    const message = backend?.message || 'Request failed';
    const statusCode = backend?.statusCode ?? err?.status;
    if (
      (statusCode === 401 || statusCode === '401') &&
      this.suppressUnauthorized
    ) {
      return throwError(() => err);
    }

    if (Array.isArray(backend?.fieldErrors) && backend.fieldErrors.length) {
      backend.fieldErrors.forEach((fe: any) => this.toast.error(String(fe)));
    } else {
      this.toast.error(message);
    }
    
    return throwError(() => err);
  }
}
