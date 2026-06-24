import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../components/service/auth/auth.service';
import { LoginData } from '../../../../models/auth.model';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [FormsModule, NgIf],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  credentials: LoginData = { email: '', password: '' };
  errorMsg = '';
  isLoading = false;
  popupVisible = false;
  popupTitle = '';
  popupMessage = '';
  popupType: 'error' | 'success' | '' = '';

  constructor(private auth: AuthService, private router: Router) {}

  showPopup(message: string, title = 'Error', type: 'error' | 'success' | '' = 'error') {
    this.popupMessage = message;
    this.popupTitle = title;
    this.popupType = type;
    this.popupVisible = true;
  }

  closePopup() {
    this.popupVisible = false;
  }

  login() {
    if (this.isLoading) return;

    this.errorMsg = '';
    this.popupVisible = false;
    this.isLoading = true;

    // DEMO MODE: Backend login authentication is disabled
    // this.auth.login(this.credentials).subscribe({
    //   next: (res) => {
    //     if (typeof window !== 'undefined') {
    //       localStorage.setItem('token', res.token);
    //     }
    //     this.isLoading = false;
    //     this.router.navigate(['/dashboard']);
    //   },
    //   error: (err) => {
    //     const errorText = err?.error?.message || 'Invalid email or password';
    //     this.errorMsg = errorText;
    //     this.showPopup(errorText, 'Login Failed', 'error');
    //     this.isLoading = false;
    //   }
    // });

    const fakeToken = 'demo-token-' + btoa(this.credentials.email + ':' + this.credentials.password);
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', fakeToken);
    }
    this.isLoading = false;
    this.router.navigate(['/dashboard']);
  }
}