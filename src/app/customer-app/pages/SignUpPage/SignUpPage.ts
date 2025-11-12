import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'signup-page',
  templateUrl: './SignUpPage.html',
  styleUrl: './SignUpPage.css',
  imports: [CommonModule],
  standalone: true
})
export class SignUpPage {
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  createAccount() {
    const name = (this.elementRef.nativeElement.querySelector('#name') as HTMLInputElement).value;
    const email = (this.elementRef.nativeElement.querySelector('#email') as HTMLInputElement).value;
    const password = (this.elementRef.nativeElement.querySelector('#password') as HTMLInputElement).value;
    const termsAccepted = (this.elementRef.nativeElement.querySelector('#terms') as HTMLInputElement).checked;

    if (!name || !email || !password) {
      alert('Please fill in all fields');
      return;
    }

    if (!termsAccepted) {
      alert('Please accept the Terms & Conditions');
      return;
    }

    alert('Account created successfully!');
    this.router.navigate(['/login']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}