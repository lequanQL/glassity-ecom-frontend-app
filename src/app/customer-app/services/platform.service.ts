import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  isBrowser(): boolean {
    // Multiple checks to ensure we're in the browser
    return (
      isPlatformBrowser(this.platformId) && 
      typeof window !== 'undefined' && 
      typeof localStorage !== 'undefined' &&
      window.localStorage !== null
    );
  }

  isServer(): boolean {
    return !this.isBrowser();
  }

  getLocalStorageItem(key: string): string | null {
    if (this.isBrowser()) {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error('Error accessing localStorage:', error);
        return null;
      }
    }
    return null;
  }

  setLocalStorageItem(key: string, value: string): boolean {
    if (this.isBrowser()) {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (error) {
        console.error('Error setting localStorage:', error);
        return false;
      }
    }
    return false;
  }

  removeLocalStorageItem(key: string): boolean {
    if (this.isBrowser()) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error('Error removing from localStorage:', error);
        return false;
      }
    }
    return false;
  }
}