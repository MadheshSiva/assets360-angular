import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../components/service/auth/auth.service';
import { RegisterData } from '../../../../models/auth.model';
import { lastValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-signup',
  imports: [FormsModule, NgIf, RouterLink],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class Signup {
  credentials: RegisterData = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  errorMsg = '';
  successMsg = '';
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

  async signup() {
    if (this.isLoading) return;

    this.errorMsg = '';
    this.successMsg = '';

    if (
      !this.credentials.fullName ||
      !this.credentials.email ||
      !this.credentials.password ||
      !this.credentials.confirmPassword
    ) {
      this.errorMsg = 'Please fill in all fields';
      this.showPopup(this.errorMsg, 'Validation Error', 'error');
      return;
    }

    if (this.credentials.password !== this.credentials.confirmPassword) {
      this.errorMsg = 'Passwords do not match';
      this.showPopup(this.errorMsg, 'Validation Error', 'error');
      return;
    }

    if (this.credentials.password.length < 6) {
      this.errorMsg = 'Password must be at least 6 characters';
      this.showPopup(this.errorMsg, 'Validation Error', 'error');
      return;
    }

    this.isLoading = true;

    try {
      console.log('Calling register with:', this.credentials);
      const response = await lastValueFrom(this.auth.register(this.credentials));
      const message = response?.message || 'Registered successfully';
      console.log('Registration successful', response);
      this.successMsg = 'Account created! Redirecting to login...';
      this.showPopup(message, 'Success', 'success');
      setTimeout(() => this.router.navigate(['/login']), 1500);
    } catch (err: any) {
      console.error('Registration failed:', err);
      const errorText =
        err?.error?.message || err?.message || 'Registration failed. Please try again.';
      this.errorMsg = errorText;
      this.showPopup(errorText, 'Registration Failed', 'error');
    } finally {
      this.isLoading = false;
    }
  }
}