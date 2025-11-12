import { Injectable, signal, Inject, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PlatformService } from './platform.service';

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'customer';
  avatar: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private platformService = inject(PlatformService);
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();

  constructor() {
    console.log('🚀 AuthService initializing...');
    // Only initialize data loading in browser environment
    if (this.platformService.isBrowser()) {
      console.log('🌐 Browser environment detected, loading data...');
      this.loadUsers();
      this.loadCurrentUser();
    } else {
      console.log('🖥️ Server environment detected, loading basic data...');
      // For SSR, just load basic data without localStorage
      this.loadUsersFromJson();
    }
  }

  private loadUsers(): void {
    // Only access localStorage in browser environment
    if (!this.platformService.isBrowser()) {
      this.loadUsersFromJson();
      return;
    }

    // Load users from localStorage first
    const localUsers = this.platformService.getLocalStorageItem('users');
    if (localUsers) {
      try {
        const users = JSON.parse(localUsers);
        this.usersSubject.next(users);
        console.log('👥 Users loaded from localStorage:', users.length + ' users');
        return;
      } catch (error) {
        console.error('❌ Error parsing users from localStorage:', error);
        this.platformService.removeLocalStorageItem('users');
      }
    }

    // Fallback to JSON file for initial seed data
    this.loadUsersFromJson();
  }

  private loadUsersFromJson(): void {
    console.log('📂 Loading initial user data from JSON file...');
    this.http.get<User[]>('assets/data/users.json').subscribe({
      next: (users: User[]) => {
        this.usersSubject.next(users);
        
        // Save to localStorage only in browser
        if (this.platformService.isBrowser()) {
          const success = this.platformService.setLocalStorageItem('users', JSON.stringify(users));
          if (success) {
            console.log('📥 User seed data loaded and saved to localStorage:', users.length + ' users');
          } else {
            console.error('❌ Error saving users to localStorage');
          }
        } else {
          console.log('📥 User seed data loaded (server-side):', users.length + ' users');
        }
      },
      error: (error: any) => {
        console.error('❌ Error loading users from JSON file:', error);
        this.usersSubject.next([]);
      }
    });
  }

  private loadCurrentUser(): void {
    // Only access localStorage in browser environment
    if (!this.platformService.isBrowser()) {
      return;
    }

    const currentUserData = this.platformService.getLocalStorageItem('currentUser');
    if (currentUserData) {
      try {
        const user = JSON.parse(currentUserData);
        this.currentUserSubject.next(user);
        console.log('👤 Current user loaded from localStorage:', user.fullName);
      } catch (error) {
        console.error('❌ Error loading current user:', error);
        this.platformService.removeLocalStorageItem('currentUser');
      }
    }
  }

  login(email: string, password: string): Observable<{ success: boolean; user?: User; message?: string }> {
    return new Observable(observer => {
      const users = this.usersSubject.value;
      const user = users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (user) {
        console.log('✅ User authenticated:', user.fullName);
        
        // Always set user in memory first
        this.currentUserSubject.next(user);
        
        // Save user to localStorage if possible (browser environment)
        const success = this.platformService.setLocalStorageItem('currentUser', JSON.stringify(user));
        if (success) {
          console.log('💾 User saved to localStorage');
        } else {
          console.log('🖥️ Server environment or error, user saved in memory only');
        }
        
        console.log('✅ Login successful, current user set:', user.fullName);
        
        // Route based on role
        if (user.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['']);
        }
        
        observer.next({ success: true, user });
      } else {
        observer.next({ success: false, message: 'Invalid email or password' });
      }
      
      observer.complete();
    });
  }

  logout(): void {
    // Only access localStorage in browser environment
    this.platformService.removeLocalStorageItem('currentUser');
    
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
    console.log('👋 User logged out');
  }

  getCurrentUser(): User | null {
    console.log('🔍 getCurrentUser() called');
    console.log('🔍 Platform check:', this.platformService.isBrowser() ? 'Browser' : 'Server');
    
    // If we already have a user in memory, return it
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      console.log('✅ User found in memory:', currentUser.fullName);
      return currentUser;
    }

    console.log('👤 No user in memory, checking localStorage...');
    
    // Check localStorage using PlatformService
    const currentUserData = this.platformService.getLocalStorageItem('currentUser');
    console.log('📦 localStorage currentUser data:', currentUserData ? 'found' : 'not found');
    
    if (currentUserData) {
      try {
        const user = JSON.parse(currentUserData);
        // Update the subject with the found user
        this.currentUserSubject.next(user);
        console.log('👤 Current user loaded from localStorage on demand:', user.fullName);
        return user;
      } catch (error) {
        console.error('❌ Error parsing current user from localStorage:', error);
        this.platformService.removeLocalStorageItem('currentUser');
      }
    }

    console.log('❌ No user found');
    return null;
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  getUsers(): Observable<User[]> {
    return this.users$;
  }

  // Method to force refresh the current user state
  refreshCurrentUser(): void {
    console.log('🔄 Refreshing current user state...');
    
    const currentUserData = this.platformService.getLocalStorageItem('currentUser');
    if (currentUserData) {
      try {
        const user = JSON.parse(currentUserData);
        this.currentUserSubject.next(user);
        console.log('✅ User state refreshed from localStorage:', user.fullName);
      } catch (error) {
        console.error('❌ Error refreshing user state:', error);
        this.currentUserSubject.next(null);
      }
    } else {
      console.log('❌ No user data found in localStorage during refresh');
      this.currentUserSubject.next(null);
    }
  }
}