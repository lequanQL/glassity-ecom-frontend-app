import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../customer-app/services/auth.service';

@Component({
  selector: 'admin-sidebar',
  templateUrl: './Sidebar.html',
  styleUrls: ['./Sidebar.css'],
  standalone: true,
  imports: [CommonModule, RouterLink]
})
export class Sidebar {
  private authService = inject(AuthService);
  
  constructor(private router: Router) {}

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  logout() {
    // Use AuthService to handle logout
    this.authService.logout();
    // Navigate to login page
    this.router.navigate(['/login']);
  }
}