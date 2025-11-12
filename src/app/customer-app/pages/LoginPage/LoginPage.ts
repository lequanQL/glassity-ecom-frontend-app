import { CommonModule, ViewportScroller } from '@angular/common';
import { Component, ElementRef, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'login-page',
  templateUrl: './LoginPage.html',
  styleUrl: './LoginPage.css',
  imports: [CommonModule],
  standalone: true
})
export class LoginPage implements OnInit {
  viewportScroller = inject(ViewportScroller);
  private router = inject(Router);
  private elementRef = inject(ElementRef);
  private authService = inject(AuthService);

  showModal = false;
  modalMessage = '';
  isLoading = false;

  ngOnInit() {
    // Check if user is already logged in
    if (this.authService.isLoggedIn()) {
      console.log('User already logged in, redirecting to homepage...');
      this.router.navigate(['/']);
    }
  }

  goToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  login() {
    const emailInput = this.elementRef.nativeElement.querySelector('#email') as HTMLInputElement;
    const passwordInput = this.elementRef.nativeElement.querySelector('#password') as HTMLInputElement;
    
    const email = emailInput?.value?.trim();
    const password = passwordInput?.value?.trim();

    // Validation
    if (!email || !password) {
      this.modalMessage = 'Please enter both email and password.';
      this.showModal = true;
      return;
    }

    this.isLoading = true;
    
    // Use AuthService to login
    this.authService.login(email, password).subscribe({
      next: (result) => {
        this.isLoading = false;
        
        if (result.success) {
          console.log('✅ Login successful, redirecting...');
          // AuthService handles navigation based on user role
        } else {
          this.modalMessage = result.message || 'Login failed. Please try again.';
          this.showModal = true;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Login error:', error);
        this.modalMessage = 'An error occurred during login. Please try again.';
        this.showModal = true;
      }
    });
  }

  closeModal() {
    this.showModal = false;
  }

  goToSignUp() {
    this.router.navigate(['/sign-up']);
  }

  goToHome() {
    this.router.navigate(['/']).then(() => {
      this.viewportScroller.scrollToPosition([0, 0]);
    });
  }
}
