import { Component, signal, inject, computed, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'personal-info',
  templateUrl: './PersonalInfo.html',
  styleUrl: './PersonalInfo.css',
  imports: [RouterLink, CommonModule]
})
export class PersonalInfo {
  public authService = inject(AuthService);
  private router = inject(Router);
  
  @Output() menuItemClicked = new EventEmitter<void>();
  
  get currentUser(): User | null {
    return this.authService.getCurrentUser();
  }

  viewProfile(): void {
    console.log('Viewing profile for:', this.currentUser?.fullName);
    this.menuItemClicked.emit();
    // Add profile editing logic here
  }

  navigateToOrders(): void {
    console.log('🔗 Navigating to order history...');
    
    // Refresh auth state before navigation
    this.authService.refreshCurrentUser();
    
    this.menuItemClicked.emit(); // Close the dropdown
    this.router.navigate(['/orders']).then(success => {
      if (success) {
        console.log('✅ Successfully navigated to /orders');
      } else {
        console.error('❌ Failed to navigate to /orders');
      }
    }).catch(error => {
      console.error('❌ Navigation error:', error);
    });
  }
}
