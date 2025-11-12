import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PriceFormatPipe } from '../../pipes/price.pipe';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { CartItem } from '../../interfaces/cart-item.interface';
import { delay } from 'rxjs';

@Component({
  selector: 'payment-page',
  templateUrl: './PaymentPage.html',
  styleUrl: './PaymentPage.css',
  imports: [CommonModule, FormsModule, PriceFormatPipe],
  standalone: true
})
export class PaymentPage implements OnInit {
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private router = inject(Router);
  private http = inject(HttpClient);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);

  cartItems = this.cartService.items;
  memberDiscount = 0;
  couponDiscount = 0;
  voucherCode = signal('');
  selectedDelivery = signal('standard');
  selectedPayment = signal('cod');
  showConfirmModal = signal(false);
  showBankPaymentModal = signal(false);
  showLoginModal = signal(false);
  orderNumber = '';
  
  // Form data
  shippingForm = signal({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    note: ''
  });
  
  shipping = computed(() => {
    return this.selectedDelivery() === 'express' ? 50000 : 35000;
  });

  ngOnInit() {}

  subtotal = computed(() => {
    return this.cartItems().reduce((sum: number, item: CartItem) => 
      sum + (item.price * item.quantity), 0);
  });

  total = computed(() => {
    return this.subtotal() + this.shipping() - this.memberDiscount - this.couponDiscount;
  });

  updateDelivery(type: string) {
    this.selectedDelivery.set(type);
  }

  updatePayment(type: string) {
    this.selectedPayment.set(type);
  }

  private viewportScroller = inject(ViewportScroller);

  showOrderConfirmation() {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.showLoginModal.set(true);
      return;
    }
    
    this.showConfirmModal.set(true);
  }

  completeOrder() {
    if (this.selectedPayment() === 'cod') {
      // For COD, directly save to order file
      this.saveOrderAndRedirect('pending', 'Order placed successfully! You will pay on delivery.');
      this.showConfirmModal.set(false);
    } else {
      // For bank transfer, show payment modal
      this.showConfirmModal.set(false);
      this.generateOrderNumber();
      this.showBankPaymentModal.set(true);
    }
  }

  confirmBankPayment() {
    // Save order as paid when user confirms bank payment
    this.saveOrderAndRedirect('processing', 'Payment confirmed! Your order is being processed.');
    this.showBankPaymentModal.set(false);
  }

  private saveOrderAndRedirect(status: string, message: string) {
    // Get only the selected items (items in wishlist are the ones being purchased)
    const selectedItems = this.cartItems().filter(item => this.isInWishlist(item));
    
    if (selectedItems.length === 0) {
      alert('Please select items to purchase.');
      return;
    }

    const order = {
      id: Date.now(),
      orderNumber: this.orderNumber || this.generateOrderNumberSync(),
      customerInfo: this.shippingForm(),
      items: selectedItems.map(item => ({
        id: item.id,
        name: item.name || item.code,
        code: item.code,
        price: item.price,
        quantity: item.quantity,
        totalPrice: item.price * item.quantity,
        img: item.img
      })),
      shipping: {
        method: this.selectedDelivery(),
        cost: this.shipping()
      },
      payment: {
        method: this.selectedPayment(),
        status: status
      },
      totals: {
        subtotal: this.subtotal(),
        shipping: this.shipping(),
        memberDiscount: this.memberDiscount,
        couponDiscount: this.couponDiscount,
        total: this.total()
      },
      createdAt: new Date().toISOString(),
      status: status
    };

    this.orderService.addOrder(order).subscribe({
      next: (savedOrder) => {
        console.log('Order saved successfully:', savedOrder);
        alert(message);
        this.removeSelectedItemsFromCart();
        this.redirectToOrders();
      },
      error: (error) => {
        console.error('Error saving order:', error);
        alert('Error saving order. Please try again.');
      }
    });
  }

  private removeSelectedItemsFromCart() {
    // Remove only the selected items from cart
    const selectedItemIds = this.cartItems()
      .filter(item => this.isInWishlist(item))
      .map(item => item.id);
    
    // Remove selected items from cart
    selectedItemIds.forEach(itemId => {
      this.cartService.removeItem(itemId);
    });

    // Clear the wishlist (selected items) - use clearWishlist to remove all selections
    this.wishlistService.clearWishlist();
  }

  private redirectToOrders() {
    this.router.navigate(['/orders']).then(() => {
      this.viewportScroller.scrollToPosition([0, 0]);
    });
  }

  closeBankPaymentModal() {
    this.showBankPaymentModal.set(false);
  }

  generateOrderNumber() {
    this.orderNumber = 'ORD' + Date.now().toString().slice(-6);
  }

  private generateOrderNumberSync() {
    return 'ORD' + Date.now().toString().slice(-6);
  }

  closeModal() {
    this.showConfirmModal.set(false);
  }

  closeLoginModal() {
    this.showLoginModal.set(false);
  }

  goToLogin() {
    this.showLoginModal.set(false);
    this.router.navigate(['/login']);
  }

  isInWishlist(item: CartItem): boolean {
    return this.wishlistService.isItemInWishlist(item.id.toString());
  }

  toggleWishlist(item: CartItem): void {
    this.wishlistService.toggleItem(item.id.toString());
  }

  incrementQuantity(item: CartItem): void {
    this.cartService.updateQuantity(item.id, item.quantity + 1);
  }

  decrementQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.id, item.quantity - 1);
    } else {
      this.cartService.removeItem(item.id);
    }
  }

  applyVoucher(): void {
    const code = this.voucherCode();
    // Add your voucher logic here
    // For now, let's just apply a fixed discount if any code is entered
    if (code.trim()) {
      this.couponDiscount = 50000; // Example discount
    } else {
      this.couponDiscount = 0;
    }
  }
}
