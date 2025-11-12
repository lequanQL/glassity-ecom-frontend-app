import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  date: Date;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipping' | 'delivered';
  shippingAddress: string;
}

@Component({
  selector: 'app-order-detail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './OrderDetailModal.html',
  styleUrl: './OrderDetailModal.css'
})
export class OrderDetailModalComponent {
  @Input() isVisible: boolean = false;
  @Input() order!: Order;
  @Output() close = new EventEmitter<void>();
  @Output() statusUpdate = new EventEmitter<{ orderId: string, status: string }>();

  selectedStatus: string = '';

  ngOnInit() {
    if (this.order) {
      this.selectedStatus = this.order.status;
    }
  }

  ngOnChanges() {
    if (this.order) {
      this.selectedStatus = this.order.status;
    }
  }

  closeModal() {
    this.close.emit();
  }

  updateStatus() {
    if (this.selectedStatus !== this.order.status) {
      this.statusUpdate.emit({
        orderId: this.order.id,
        status: this.selectedStatus
      });
    }
    this.closeModal();
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