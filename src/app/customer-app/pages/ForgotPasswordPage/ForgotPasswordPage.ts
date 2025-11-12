import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'forgot-password-page',
  templateUrl: './ForgotPasswordPage.html',
  styleUrl: './ForgotPasswordPage.css',
  imports: [CommonModule],
  standalone: true
})
export class ForgotPasswordPage {
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  isCodeSent = false;
  verificationCode = ['', '', '', '', '', ''];

  sendRequestCode() {
    const email = (this.elementRef.nativeElement.querySelector('#email') as HTMLInputElement).value;
    
    if (!email) {
      alert('Please enter your email');
      return;
    }

    this.isCodeSent = true;
  }

  onCodeInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    
    const currentValue = input.value;
    
    input.value = '';
    this.verificationCode[index] = '';
    
    if (currentValue) {
      const digit = currentValue.replace(/[^0-9]/g, '').slice(-1);
      if (digit) {
        input.value = digit;
        this.verificationCode[index] = digit;
        input.value = '';
      }
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    
    const pastedText = event.clipboardData?.getData('text') || '';
    const numbers = pastedText.replace(/[^0-9]/g, '').split('').slice(0, 6);
    
    const inputs = this.elementRef.nativeElement.querySelectorAll('.code-inputs input');
    numbers.forEach((num, index) => {
      if (inputs[index]) {
        (inputs[index] as HTMLInputElement).value = num;
        this.verificationCode[index] = num;
      }
    });
  }

  confirmCode() {
    const inputs = this.elementRef.nativeElement.querySelectorAll('.code-inputs input');
    const code = Array.from(inputs, (input: Element) => (input as HTMLInputElement).value).join('');
    
    if (code.length !== 6) {
      alert('Please enter all 6 digits');
      return;
    }

    if (code !== '123456') { // Demo validation code
      alert('Wrong code');
      return;
    }

    this.router.navigate(['/reset-password']);
  }

  resendCode() {
    alert('Verification code has been resent');
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}