import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../customer-app/services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.getCurrentUser();
  
  // Check if user is logged in and has admin role
  if (currentUser && currentUser.role === 'admin') {
    return true;
  }

  // For any non-admin access (not logged in or not admin), redirect to forbidden
  router.navigate(['/forbidden']);
  return false;
};