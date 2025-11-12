import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductItem } from '../../components/ProductItem/ProductItem';
import { RelatedProductsComponent } from '../../components/RelatedProducts/RelatedProducts';
import { Subscription } from 'rxjs';
import { ViewportScroller } from '@angular/common';
import { PriceFormatPipe } from "../../pipes/price.pipe";
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { CommonModule } from '@angular/common';

interface ProductColor {
  name: string;
  code: string;
  image: string;
  stock: number;
}

interface Product {
  id: number;
  code: string;
  name: string;
  fullName: string;
  price: number;
  originalPrice: number;
  stock: number;
  category: string;
  collection: string;
  status: string;
  description: string;
  materials: {
    frame: string;
    lens: string;
    temple: string;
  };
  specifications: {
    lensWidth: number;
    bridgeWidth: number;
    templeLength: number;
    frameWidth: number;
    frameHeight: number;
    weight: string;
  };
  features: string[];
  colors: ProductColor[];
  defaultColor: string;
  img: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  relatedProducts: number[];
}

@Component({
  selector: 'product-detail',
  templateUrl: './ProductDetailPage.html',
  styleUrl: './ProductDetailPage.css',
  standalone: true,
  imports: [CommonModule, RelatedProductsComponent, PriceFormatPipe]
})
export class ProductDetailPage implements OnInit, OnDestroy {
  private routeSub: Subscription | undefined;
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  id = '';
  products: Product[] = [];
  product: Product | null = null;
  selectedColor: ProductColor | null = null;
  currentImage: string = '';
  Math = Math; // Expose Math object to template

  constructor(
    private route: ActivatedRoute, 
    private http: HttpClient,
    private viewportScroller: ViewportScroller,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to route parameter changes
    this.routeSub = this.route.params.subscribe(params => {
      this.id = String(params['id']);
      this.loadProduct();
      // Scroll to top when params change
      this.viewportScroller.scrollToPosition([0, 0]);
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription when component is destroyed
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  private loadProduct(): void {
    this.http.get<Product[]>('assets/data/products.json').subscribe(data => {
      this.products = data;
      this.product = this.products.find(p => p.id === Number(this.id)) || null;
      
      if (this.product) {
        // Set default color and image
        this.selectedColor = this.product.colors.find(c => c.code === this.product!.defaultColor) || this.product.colors[0];
        this.currentImage = this.selectedColor.image;
      }
    });
  }

  selectColor(color: ProductColor): void {
    this.selectedColor = color;
    this.currentImage = color.image;
  }

  addToCart() {
    if (this.product && this.selectedColor) {
      alert(`Added ${this.product.name} in ${this.selectedColor.name} to cart`);
      const cartItem = {
        ...this.product,
        selectedColor: this.selectedColor,
        quantity: 1,
        img: this.currentImage
      };
      this.cartService.addItem(cartItem);
      // Auto add to wishlist when adding to cart
      this.wishlistService.toggleItem(this.product.id.toString());
    }
  }

  buyNow() {
    if (this.product && this.selectedColor) {
      const cartItem = {
        ...this.product,
        selectedColor: this.selectedColor,
        quantity: 1,
        img: this.currentImage
      };
      this.cartService.addItem(cartItem);
      // Auto add to wishlist when adding to cart
      this.wishlistService.toggleItem(this.product.id.toString());
      this.router.navigate(['/payment']);
    }
  }
}
