import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { CartService } from './cart.service';
import { CartItem } from '../interfaces/cart-item.interface';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private wishlistItems = signal<Set<string>>(new Set());
  private cartService = inject(CartService);

  public items: Signal<Set<string>> = computed(() => this.wishlistItems());
  
  public totalPrice = computed(() => {
    const items = this.cartService.items();
    return items
      .filter(item => this.wishlistItems().has(item.id.toString()))
      .reduce((total, item) => total + (item.price * item.quantity), 0);
  });

  toggleItem(productCode: string): void {
    const currentItems = new Set(this.wishlistItems());
    if (currentItems.has(productCode)) {
      currentItems.delete(productCode);
    } else {
      currentItems.add(productCode);
    }
    this.wishlistItems.set(currentItems);
  }

  isItemInWishlist(productCode: string): boolean {
    return this.wishlistItems().has(productCode);
  }

  clearWishlist(): void {
    this.wishlistItems.set(new Set());
  }

  addAllItems(productCodes: string[]): void {
    this.wishlistItems.set(new Set(productCodes));
  }

  readonly wishlistCount = computed(() => {
    const items = this.cartService.items();
    return items
      .filter(item => this.wishlistItems().has(item.id.toString()))
      .reduce((total, item) => total + item.quantity, 0);
  });
}