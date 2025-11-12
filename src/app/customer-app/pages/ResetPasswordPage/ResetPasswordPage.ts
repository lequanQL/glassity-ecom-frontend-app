import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-reset-password',
    templateUrl: './ResetPasswordPage.html',
    styleUrls: ['./ResetPasswordPage.css'],
    standalone: true,
    imports: [CommonModule, FormsModule]
})
export class ResetPasswordPage {
    newPassword: string = '';
    confirmPassword: string = '';

    constructor(private router: Router) {}

    handleResetPassword() {
        if (!this.newPassword || !this.confirmPassword) {
            alert('Please fill in all fields');
            return;
        }

        if (this.newPassword !== this.confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        // Here you would typically call an API to update the password
        alert('Password reset successful!');
        // Redirect to login
        this.router.navigate(['/login']);
    }

    goToLogin() {
        this.router.navigate(['/login']);
    }
}