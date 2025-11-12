import { NgFor } from '@angular/common';
import {ChangeDetectionStrategy, Component, inject, computed} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { CartItem } from '../CartItem/CartItem';
import { PriceFormatPipe } from '../../pipes/price.pipe';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { Router } from '@angular/router';

@Component({
  selector: 'cart',
  templateUrl: './Cart.html',
  styleUrl: './Cart.css',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, CartItem, NgFor, PriceFormatPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cart {
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private router = inject(Router);
  
  products = this.cartService.items;
  totalPrice = this.cartService.totalPrice;
  totalItems = this.cartService.totalItems;
  wishlistCount = this.wishlistService.wishlistCount;
  wishlistTotalPrice = this.wishlistService.totalPrice;

  isAllSelected(): boolean {
    const products = this.products();
    if (products.length === 0) return false;
    return products.every(product => this.wishlistService.isItemInWishlist(product.id.toString()));
  }

  toggleSelectAll(): void {
    const products = this.products();
    if (this.isAllSelected()) {
      this.wishlistService.clearWishlist();
    } else {
      this.wishlistService.addAllItems(products.map(p => p.id.toString()));
    }
  }

  navigateToPayment() {
    const count = this.wishlistCount();
    if (count > 0) {
      this.router.navigate(['/payment']);
    }
  }
}
