import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PriceFormatPipe } from '../../pipes/price.pipe';
import { OrderService, Order } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'order-history-page',
  templateUrl: './OrderHistoryPage.html',
  styleUrl: './OrderHistoryPage.css',
  imports: [CommonModule, RouterLink, PriceFormatPipe],
  standalone: true
})
export class OrderHistoryPage implements OnInit {
  orders = signal<Order[]>([]);
  selectedOrder = signal<Order | null>(null);
  showOrderDetail = signal(false);
  
  private orderService = inject(OrderService);
  private authService = inject(AuthService);

  ngOnInit() {
    // Force refresh the auth state first
    this.authService.refreshCurrentUser();
    
    // Add a delay to ensure services are properly initialized and check multiple times
    this.checkAuthAndLoadOrders();
  }

  private checkAuthAndLoadOrders(attempt: number = 1): void {
    const maxAttempts = 3;
    const delay = attempt * 200; // Progressive delay: 200ms, 400ms, 600ms

    setTimeout(() => {
      try {
        const currentUser = this.authService.getCurrentUser();
        
        if (currentUser) {
          console.log(`✅ User authenticated on attempt ${attempt}:`, currentUser.fullName);
          this.loadAllOrders();
        } else if (attempt < maxAttempts) {
          console.log(`⏳ User not found on attempt ${attempt}, retrying...`);
          this.checkAuthAndLoadOrders(attempt + 1);
        } else {
          console.warn('⚠️ User not logged in after all attempts, redirecting to login');
          this.authService.logout();
        }
      } catch (error) {
        console.error('❌ Error checking authentication:', error);
        if (attempt < maxAttempts) {
          this.checkAuthAndLoadOrders(attempt + 1);
        } else {
          this.loadAllOrders();
        }
      }
    }, delay);
  }

  private loadAllOrders(): void {
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        const sortedOrders = orders.sort((a: Order, b: Order) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.orders.set(sortedOrders);
        console.log(`📋 Loaded all ${orders.length} orders`);
      },
      error: (error) => {
        console.error('❌ Error loading orders:', error);
        this.orders.set([]);
      }
    });
  }

  viewOrderDetail(order: Order) {
    this.selectedOrder.set(order);
    this.showOrderDetail.set(true);
  }

  closeOrderDetail() {
    this.showOrderDetail.set(false);
    this.selectedOrder.set(null);
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'processing': return 'status-processing';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  }

  getStatusText(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'Pending';
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  }

  getPaymentMethodText(method: string): string {
    return method === 'cod' ? 'Cash on Delivery' : 'Bank Transfer';
  }

  getShippingMethodText(method: string): string {
    return method === 'express' ? 'Express Delivery' : 'Standard Delivery';
  }
}