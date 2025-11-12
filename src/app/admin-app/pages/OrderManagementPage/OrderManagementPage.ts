import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderDetailModalComponent, Order, OrderItem } from '../../components/OrderDetailModal/OrderDetailModal';
import { OrderService } from '../../../customer-app/services/order.service';

@Component({
  selector: 'order-management-page',
  templateUrl: './OrderManagementPage.html',
  styleUrls: ['./OrderManagementPage.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, OrderDetailModalComponent]
})
export class OrderManagementPage implements OnInit {
  searchTerm: string = '';
  selectAll: boolean = false;
  selectedOrders: Set<string> = new Set();
  showOrderModal: boolean = false;
  selectedOrder: Order | null = null;
  orders: Order[] = [];

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getOrders().subscribe({
      next: (rawOrders) => {
        // Transform the data to match the expected Order interface for admin
        this.orders = rawOrders.map((order: any) => ({
          id: order.orderNumber || order.id.toString(),
          date: new Date(order.createdAt),
          customerName: order.customerInfo.fullName,
          customerEmail: order.customerInfo.email,
          customerPhone: order.customerInfo.phone,
          items: order.items.map((item: any) => ({
            id: item.id.toString(),
            name: item.name || item.code,
            price: item.price,
            quantity: item.quantity,
            image: item.img
          })),
          total: order.totals.total,
          status: this.mapOrderStatus(order.status),
          shippingAddress: `${order.customerInfo.address}, ${order.customerInfo.ward}, ${order.customerInfo.district}, ${order.customerInfo.city}`
        }));
        
        // Sort by date (newest first)
        this.orders.sort((a, b) => b.date.getTime() - a.date.getTime());
      },
      error: (error) => {
        console.error('Error loading orders:', error);
      }
    });
  }

  private mapOrderStatus(status: string): 'pending' | 'processing' | 'shipping' | 'delivered' {
    switch (status.toLowerCase()) {
      case 'processing': return 'processing';
      case 'shipped': return 'shipping';
      case 'delivered': return 'delivered';
      case 'cancelled': return 'delivered'; // Map cancelled to delivered for admin interface
      default: return 'pending';
    }
  }

  private mapToOriginalStatus(adminStatus: string): string {
    switch (adminStatus.toLowerCase()) {
      case 'pending': return 'pending';
      case 'processing': return 'processing';
      case 'shipping': return 'shipped';
      case 'delivered': return 'delivered';
      default: return adminStatus;
    }
  }

  get filteredOrders(): Order[] {
    if (!this.searchTerm.trim()) {
      return this.orders;
    }
    
    const term = this.searchTerm.toLowerCase();
    return this.orders.filter(order => 
      order.id.toLowerCase().includes(term) ||
      order.customerName.toLowerCase().includes(term) ||
      order.customerEmail.toLowerCase().includes(term)
    );
  }

  toggleSelectAll() {
    if (this.selectAll) {
      this.selectedOrders = new Set(this.filteredOrders.map(order => order.id));
    } else {
      this.selectedOrders.clear();
    }
  }

  toggleOrderSelection(orderId: string) {
    if (this.selectedOrders.has(orderId)) {
      this.selectedOrders.delete(orderId);
    } else {
      this.selectedOrders.add(orderId);
    }
    
    // Update selectAll state
    this.selectAll = this.selectedOrders.size === this.filteredOrders.length;
  }

  viewOrderDetail(order: Order) {
    this.selectedOrder = order;
    this.showOrderModal = true;
  }

  closeOrderModal() {
    this.showOrderModal = false;
    this.selectedOrder = null;
  }

  updateOrderStatus(event: { orderId: string, status: string }) {
    const order = this.orders.find(o => o.id === event.orderId);
    if (order) {
      // Convert admin status to original order status format
      const originalStatus = this.mapToOriginalStatus(event.status);
      
      // Update using the OrderService (which automatically handles localStorage persistence)
      this.orderService.updateOrderStatus(event.orderId, originalStatus).subscribe({
        next: (updatedOrder: any) => {
          if (updatedOrder) {
            // Update the local order display immediately
            order.status = event.status as any;
            console.log(`✅ Order ${event.orderId} status updated to "${event.status}"`);
          } else {
            console.warn(`⚠️ Order ${event.orderId} not found for status update`);
          }
        },
        error: (error: any) => {
          console.error('❌ Error updating order status:', error);
        }
      });
    }
  }

  exportOrders() {
    console.log('Exporting orders...', this.selectedOrders.size > 0 ? Array.from(this.selectedOrders) : 'all orders');
    // Implement export logic here
  }

  getTotalItems(order: Order): number {
    return order.items.reduce((total, item) => total + item.quantity, 0);
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'Đang chờ';
      case 'processing': return 'Đang xử lý';
      case 'shipping': return 'Đang giao';
      case 'delivered': return 'Đã giao';
      default: return status;
    }
  }
}