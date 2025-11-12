import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface OrderItem {
  id: number;
  name: string;
  code: string;
  price: number;
  quantity: number;
  totalPrice: number;
  img: string;
}

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  note: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerInfo: CustomerInfo;
  items: OrderItem[];
  shipping: {
    method: string;
    cost: number;
  };
  payment: {
    method: string;
    status: string;
  };
  totals: {
    subtotal: number;
    shipping: number;
    memberDiscount: number;
    couponDiscount: number;
    total: number;
  };
  createdAt: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  public orders$ = this.ordersSubject.asObservable();

  constructor() {
    // Only initialize data loading in browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.loadOrders();
    } else {
      // For SSR, just load basic data without localStorage
      this.loadOrdersFromJson();
    }
  }

  loadOrders(): void {
    // Strategy: Use localStorage as the primary data store, JSON file as initial seed data
    console.log('🔄 Loading orders...');
    
    // Only access localStorage in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      this.loadOrdersFromJson();
      return;
    }
    
    // First, try to load from localStorage (contains all user-created orders)
    try {
      const localStorageData = localStorage.getItem('orders');
      if (localStorageData) {
        const orders = JSON.parse(localStorageData);
        this.ordersSubject.next(orders);
        console.log('✅ Orders loaded from localStorage (persistent data):', orders.length + ' orders');
        return;
      }
    } catch (error) {
      console.error('❌ Error reading from localStorage:', error);
      // Clear corrupted localStorage data safely
      try {
        localStorage.removeItem('orders');
      } catch (removeError) {
        console.error('❌ Error removing corrupted localStorage data:', removeError);
      }
    }

    // If localStorage is empty, load initial seed data from JSON file
    this.loadOrdersFromJson();
  }

  private loadOrdersFromJson(): void {
    console.log('📂 No localStorage data found, loading initial seed data from JSON file...');
    this.http.get<Order[]>('assets/data/orders.json').subscribe({
      next: (seedOrders) => {
        this.ordersSubject.next(seedOrders);
        
        // Save the seed data to localStorage for future persistence (only in browser)
        if (isPlatformBrowser(this.platformId)) {
          try {
            localStorage.setItem('orders', JSON.stringify(seedOrders));
            console.log('📥 Seed data loaded and saved to localStorage:', seedOrders.length + ' orders');
          } catch (error) {
            console.error('❌ Error saving seed data to localStorage:', error);
          }
        } else {
          console.log('📥 Seed data loaded (server-side):', seedOrders.length + ' orders');
        }
      },
      error: (error) => {
        console.log('📂 No JSON file found or error loading seed data:', error);
        // Start with empty array if both sources fail
        this.ordersSubject.next([]);
        if (isPlatformBrowser(this.platformId)) {
          try {
            localStorage.setItem('orders', JSON.stringify([]));
            console.log('🔄 Started with empty orders array');
          } catch (error) {
            console.error('❌ Error initializing localStorage:', error);
          }
        }
      }
    });
  }

  getOrders(): Observable<Order[]> {
    return this.orders$;
  }

  addOrder(order: Order): Observable<Order> {
    return new Observable(observer => {
      const currentOrders = this.ordersSubject.value;
      const updatedOrders = [...currentOrders, order];
      
      // Update the local state immediately for UI responsiveness
      this.ordersSubject.next(updatedOrders);
      
      // Save to localStorage (acts as our persistent database) - only in browser
      if (isPlatformBrowser(this.platformId)) {
        try {
          localStorage.setItem('orders', JSON.stringify(updatedOrders));
          console.log('💾 Order saved to localStorage:', order.orderNumber);
        } catch (error) {
          console.error('❌ Error saving order to localStorage:', error);
          // Revert the state if localStorage fails
          this.ordersSubject.next(currentOrders);
          observer.error(error);
          return;
        }
      } else {
        console.log('💾 Order saved (server-side):', order.orderNumber);
      }
      
      // Simulate realistic API delay
      setTimeout(() => {
        observer.next(order);
        observer.complete();
      }, 300);
    });
  }

  updateOrderStatus(orderNumber: string, status: string): Observable<Order | null> {
    return new Observable(observer => {
      const currentOrders = this.ordersSubject.value;
      const orderIndex = currentOrders.findIndex(order => order.orderNumber === orderNumber);
      
      if (orderIndex !== -1) {
        const updatedOrders = [...currentOrders];
        updatedOrders[orderIndex] = { 
          ...updatedOrders[orderIndex], 
          status 
        };
        
        // Update the state
        this.ordersSubject.next(updatedOrders);
        
        // Save to localStorage (persistent storage for both customer and admin) - only in browser
        if (isPlatformBrowser(this.platformId)) {
          try {
            localStorage.setItem('orders', JSON.stringify(updatedOrders));
            console.log(`💾 Order ${orderNumber} status updated to "${status}" and saved to localStorage`);
          } catch (error) {
            console.error('❌ Error saving status update to localStorage:', error);
          }
        } else {
          console.log(`💾 Order ${orderNumber} status updated to "${status}" (server-side)`);
        }
        
        observer.next(updatedOrders[orderIndex]);
      } else {
        console.warn(`⚠️ Order ${orderNumber} not found`);
        observer.next(null);
      }
      observer.complete();
    });
  }
}