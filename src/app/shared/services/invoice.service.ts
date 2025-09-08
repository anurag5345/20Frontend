import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastService } from '../ui/toast.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private api = `${environment.apiUrl}/invoices`;

  constructor(private http: HttpClient, private toast: ToastService, private auth: AuthService) {}

  list(options?: { page?: number; limit?: number; search?: string; status?: string }) {
    if (options && Object.keys(options).length) {
      let params = new HttpParams();
      if (options.page != null) params = params.set('page', String(options.page));
      if (options.limit != null) params = params.set('limit', String(options.limit));
      if (options.search) params = params.set('search', String(options.search));
      if (options.status) params = params.set('status', String(options.status));

      return this.http.get<any>(this.api, { params }).pipe(
        map((res) => {
          const payload = res?.data;
          if (payload) {
            if (Array.isArray(payload.items)) {
              return {
                data: payload.items,
                meta: { total: payload.total, page: payload.page, limit: payload.limit },
              };
            }

            if (Array.isArray(payload)) {
              return { data: payload, meta: { total: payload.length } };
            }
          }

          if (res && Array.isArray(res.items)) {
            return {
              data: res.items,
              meta: { total: res.total, page: res.page, limit: res.limit },
            };
          }

          return res;
        }),
        catchError((err) => this.handleError(err))
      );
    }
    return this.http.get<any>(this.api).pipe(
      map((res) => {
        const payload = res?.data ?? res;
        if (Array.isArray(payload)) return payload;
        if (payload && Array.isArray(payload.items)) return payload.items;
        if (res && Array.isArray(res.items)) return res.items;
        return [];
      }),
      catchError((err) => this.handleError(err))
    );
  }

  get(id: number) {
    return this.http.get<any>(`${this.api}/${id}`).pipe(
      map((res) => res.data),
      catchError((err) => this.handleError(err))
    );
  }

  create(payload: any) {
    return this.http.post<any>(this.api, payload).pipe(
      map((res) => res.data),
      catchError((err) => this.handleError(err))
    );
  }

  update(id: number, payload: any) {
    return this.http.put<any>(`${this.api}/${id}`, payload).pipe(
      map((res) => res.data),
      catchError((err) => this.handleError(err))
    );
  }

  delete(id: number) {
    return this.http.delete<any>(`${this.api}/${id}`).pipe(
      map((res) => res.data),
      catchError((err) => this.handleError(err))
    );
  }

  downloadPdf(id: number) {
    const url = `${this.api}/${id}/pdf`;
    return this.http.get(url, { responseType: 'blob' as 'json' });
  }

  previewPdf(payload: any) {
    const url = `${this.api}/preview/pdf`;
    return this.http.post(url, payload, { responseType: 'blob' as 'json' });
  }

  private handleError(err: any) {
    const backend = err?.error ?? err;
    const message = backend?.message || 'Request failed';

    const statusCode = backend?.statusCode ?? err?.status;
    if ((statusCode === 401 || statusCode === '401') && (this.auth as any).suppressUnauthorized) {
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
