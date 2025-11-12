import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface Customer {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  dateOfBirth: string;
  gender: string;
  joinedDate: string;
  lastOrderDate: string;
  totalOrders: number;
  totalSpent: number;
  status: string;
  membershipLevel: string;
  notes: string;
  selected?: boolean; // For admin UI selection
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  
  private customersSubject = new BehaviorSubject<Customer[]>([]);
  public customers$ = this.customersSubject.asObservable();

  constructor() {
    console.log('🚀 CustomerService initializing...');
    // Only initialize data loading in browser environment
    if (isPlatformBrowser(this.platformId)) {
      console.log('🌐 Browser environment detected, loading customers...');
      this.loadCustomers();
    } else {
      console.log('🖥️ Server environment detected, skipping localStorage operations');
      // For SSR, just load from JSON file
      this.loadCustomersFromJson();
    }
  }

  private loadCustomers(): void {
    // Only access localStorage in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      this.loadCustomersFromJson();
      return;
    }

    // Load customers from localStorage first
    try {
      const localCustomers = localStorage.getItem('customers');
      if (localCustomers) {
        const customers = JSON.parse(localCustomers);
        this.customersSubject.next(customers);
        console.log('👥 Customers loaded from localStorage:', customers.length + ' customers');
        return;
      }
    } catch (error) {
      console.error('❌ Error parsing customers from localStorage:', error);
      try {
        localStorage.removeItem('customers');
      } catch (removeError) {
        console.error('❌ Error removing corrupted localStorage data:', removeError);
      }
    }

    // Fallback to JSON file for initial seed data
    this.loadCustomersFromJson();
  }

  private loadCustomersFromJson(): void {
    console.log('📂 Loading initial customer data from JSON file...');
    this.http.get<Customer[]>('assets/data/customers.json').subscribe({
      next: (customers: Customer[]) => {
        this.customersSubject.next(customers);
        
        // Save to localStorage only in browser
        if (isPlatformBrowser(this.platformId)) {
          try {
            localStorage.setItem('customers', JSON.stringify(customers));
            console.log('📥 Customer seed data loaded and saved to localStorage:', customers.length + ' customers');
          } catch (error) {
            console.error('❌ Error saving customers to localStorage:', error);
          }
        } else {
          console.log('📥 Customer seed data loaded (server-side):', customers.length + ' customers');
        }
      },
      error: (error: any) => {
        console.error('❌ Error loading customers from JSON file:', error);
        this.customersSubject.next([]);
      }
    });
  }

  getCustomers(): Observable<Customer[]> {
    return this.customers$;
  }

  addCustomer(customer: Customer): Observable<Customer> {
    return new Observable(observer => {
      const currentCustomers = this.customersSubject.value;
      const newCustomer = {
        ...customer,
        id: this.generateNextId(currentCustomers)
      };
      const updatedCustomers = [...currentCustomers, newCustomer];
      
      // Update the local state immediately for UI responsiveness
      this.customersSubject.next(updatedCustomers);
      
      // Save to localStorage (acts as our persistent database) - only in browser
      if (isPlatformBrowser(this.platformId)) {
        try {
          localStorage.setItem('customers', JSON.stringify(updatedCustomers));
          console.log('💾 Customer saved to localStorage:', newCustomer.fullName);
        } catch (error) {
          console.error('❌ Error saving customer to localStorage:', error);
          // Revert the state if localStorage fails
          this.customersSubject.next(currentCustomers);
          observer.error(error);
          return;
        }
      } else {
        console.log('💾 Customer saved (server-side):', newCustomer.fullName);
      }
      
      // Simulate realistic API delay
      setTimeout(() => {
        observer.next(newCustomer);
        observer.complete();
      }, 300);
    });
  }

  updateCustomer(updatedCustomer: Customer): Observable<Customer | null> {
    return new Observable(observer => {
      const currentCustomers = this.customersSubject.value;
      const customerIndex = currentCustomers.findIndex(customer => customer.id === updatedCustomer.id);
      
      if (customerIndex !== -1) {
        const updatedCustomers = [...currentCustomers];
        updatedCustomers[customerIndex] = updatedCustomer;
        
        // Update the state
        this.customersSubject.next(updatedCustomers);
        
        // Save to localStorage (persistent storage) - only in browser
        if (isPlatformBrowser(this.platformId)) {
          try {
            localStorage.setItem('customers', JSON.stringify(updatedCustomers));
            console.log(`💾 Customer ${updatedCustomer.fullName} updated and saved to localStorage`);
          } catch (error) {
            console.error('❌ Error saving customer update to localStorage:', error);
          }
        } else {
          console.log(`💾 Customer ${updatedCustomer.fullName} updated (server-side)`);
        }
        
        observer.next(updatedCustomers[customerIndex]);
      } else {
        console.warn(`⚠️ Customer ${updatedCustomer.fullName} not found`);
        observer.next(null);
      }
      observer.complete();
    });
  }

  deleteCustomer(customerId: number): Observable<boolean> {
    return new Observable(observer => {
      const currentCustomers = this.customersSubject.value;
      const customerIndex = currentCustomers.findIndex(customer => customer.id === customerId);
      
      if (customerIndex !== -1) {
        const updatedCustomers = currentCustomers.filter(customer => customer.id !== customerId);
        
        // Update the state
        this.customersSubject.next(updatedCustomers);
        
        // Save to localStorage (persistent storage) - only in browser
        if (isPlatformBrowser(this.platformId)) {
          try {
            localStorage.setItem('customers', JSON.stringify(updatedCustomers));
            console.log(`🗑️ Customer ID ${customerId} deleted and saved to localStorage`);
          } catch (error) {
            console.error('❌ Error saving customer deletion to localStorage:', error);
          }
        } else {
          console.log(`🗑️ Customer ID ${customerId} deleted (server-side)`);
        }
        
        observer.next(true);
      } else {
        console.warn(`⚠️ Customer ID ${customerId} not found for deletion`);
        observer.next(false);
      }
      observer.complete();
    });
  }

  getCustomerStats(): Observable<{totalCustomers: number, activeCustomers: number, totalRevenue: number, avgOrderValue: number}> {
    return new Observable(observer => {
      const customers = this.customersSubject.value;
      const activeCustomers = customers.filter(c => c.status === 'Active').length;
      const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
      const totalOrders = customers.reduce((sum, c) => sum + c.totalOrders, 0);
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      observer.next({
        totalCustomers: customers.length,
        activeCustomers,
        totalRevenue,
        avgOrderValue
      });
      observer.complete();
    });
  }

  private generateNextId(customers: Customer[]): number {
    const maxId = customers.reduce((max, customer) => Math.max(max, customer.id), 0);
    return maxId + 1;
  }
}