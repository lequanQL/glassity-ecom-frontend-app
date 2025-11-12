import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'forbidden-page',
  templateUrl: './ForbiddenPage.html',
  styleUrl: './ForbiddenPage.css',
  imports: [CommonModule],
  standalone: true
})
export class ForbiddenPage {
  private router = inject(Router);

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToHome(): void {
    this.router.navigate(['']);
  }
}