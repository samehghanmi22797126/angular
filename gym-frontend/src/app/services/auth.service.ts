import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginPayload { email: string; password: string }

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Use backend full URL (adjust port if your API uses another)
  private base = 'http://localhost:5280/api/auth';
  constructor(private http: HttpClient) {}

  login(payload: LoginPayload): Observable<any> {
    return this.http.post<any>(`${this.base}/login`, payload);
  }

  // placeholder register (backend endpoint optional)
  register(payload: any): Observable<any> {
    // if you add a backend register endpoint implement POST here
    // return this.http.post<any>(`${this.base}/register`, payload);
    return new Observable(observer => {
      // simulate success
      setTimeout(() => {
        observer.next({ id: Date.now(), ...payload, role: payload.role || 'member' });
        observer.complete();
      }, 300);
    });
  }
}
