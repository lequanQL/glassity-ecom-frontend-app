import { Injectable, signal } from '@angular/core';
import { computed } from '@angular/core';

export interface CartItem {
  id: number;
  name: string;
  code: string;
  price: number;
  img: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  readonly items = signal<CartItem[]>([]);

  // Computed total price
  readonly totalPrice = computed(() => {
    return this.items().reduce((total, item) => total + (item.price * item.quantity), 0);
  });

  // Computed total items
  readonly totalItems = computed(() => {
    return this.items().reduce((total, item) => total + item.quantity, 0);
  });

  // Get all cart items
  getItems() {
    return this.items();
  }

  // Add item to cart
  addItem(item: Omit<CartItem, 'quantity'>) {
    const existingItem = this.items().find((i: CartItem) => i.id === item.id);
    
    if (existingItem) {
      this.updateQuantity(item.id, existingItem.quantity + 1);
    } else {
      this.items.update((items: CartItem[]) => [...items, { ...item, quantity: 1 }]);
    }
  }

  // Update item quantity
  updateQuantity(itemId: number, quantity: number) {
    if (quantity < 1) return;
    
    this.items.update((items: CartItem[]) => 
      items.map((item: CartItem) => 
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  }

  // Remove item from cart
  removeItem(itemId: number) {
    this.items.update((items: CartItem[]) => 
      items.filter((item: CartItem) => item.id !== itemId)
    );
  }

  // Get cart items count
  getItemsCount() {
    return this.items().reduce((count: number, item: CartItem) => count + item.quantity, 0);
  }
}