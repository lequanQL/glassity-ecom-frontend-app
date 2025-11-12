import { Component, Input, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PriceFormatPipe } from '../../pipes/price.pipe';
import { CartService } from '../../services/cart.service';
import { CartItem as CartItemInterface } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';

@Component({
  selector: 'cart-item',
  templateUrl: './CartItem.html',
  styleUrl: './CartItem.css',
  standalone: true,
  imports: [PriceFormatPipe]
})
export class CartItem {
  @Input() product!: CartItemInterface;
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);

  isInWishlist(): boolean {
    return this.wishlistService.isItemInWishlist(this.product.id.toString());
  }

  toggleWishlist(): void {
    this.wishlistService.toggleItem(this.product.id.toString());
  }
  
  incrementQuantity() {
    this.cartService.updateQuantity(this.product.id, this.product.quantity + 1);
  }
  
  decrementQuantity() {
    if (this.product.quantity > 1) {
      this.cartService.updateQuantity(this.product.id, this.product.quantity - 1);
    } else {
      // If quantity would become 0, remove the item from cart
      this.cartService.removeItem(this.product.id);
    }
  }
}
