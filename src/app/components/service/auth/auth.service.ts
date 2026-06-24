import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { RegisterData, LoginData, AuthResponse, RegisterResponse } from '../../../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  register(data: RegisterData): Observable<RegisterResponse> {
    // DEMO MODE: Backend registration is disabled
    // return this.http.post<RegisterResponse>(`${this.apiUrl}api/auth/register`, data).pipe(
    //   tap(response => console.log('Register response:', response))
    // );
    console.log('DEMO MODE: Registration bypassed for data:', data);
    const mockResponse: RegisterResponse = { message: 'Demo account created!', email: data.email };
    return of(mockResponse);
  }

  login(data: LoginData): Observable<AuthResponse> {
    // DEMO MODE: Backend login authentication is disabled
    // return this.http.post<AuthResponse>(`${this.apiUrl}api/auth/login`, data).pipe(
    //   tap((response: AuthResponse) => {
    //     if (response?.token) {
    //       localStorage.setItem('token', response.token);
    //     }
    //   })
    // );
    console.log('DEMO MODE: Login bypassed for data:', data);
    const fakeToken = 'demo-token-' + btoa(data.email + ':' + data.password);
    const mockResponse: AuthResponse = { token: fakeToken, message: 'Demo login successful' };
    return of(mockResponse);
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return typeof window !== 'undefined' && !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  }
}