import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ProductItem } from '../ProductItem/ProductItem';
import { OnInit, OnChanges } from '@angular/core';

interface Product {
  id: number;
  code: string;
  name: string;
  price: number;
  img: string;
  relatedProducts?: number[];
}

@Component({
  selector: 'app-related-products',
  templateUrl: './RelatedProducts.html',
  styleUrl: './RelatedProducts.css',
  standalone: true,
  imports: [CommonModule, ProductItem]
})
export class RelatedProductsComponent implements OnInit, OnChanges {
  @Input() productIds: number[] = []; // IDs of products to show
  @Input() currentProductId?: number; // Current product ID to exclude
  @Input() title: string = '* RELATED GLASSES *';
  @Input() maxItems: number = 4;
  @Input() showMoreIcon: boolean = true;
  @Input() category?: string; // Filter by category
  @Input() collection?: string; // Filter by collection
  @Input() itemsPerSlide: number = 4; // Number of products per slide

  relatedProducts: Product[] = [];
  allProducts: Product[] = [];
  
  // Carousel properties
  slides: Product[][] = [];
  currentSlide: number = 0;
  totalSlides: number = 0;
  dots: number[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadProducts();
  }

  ngOnChanges() {
    if (this.allProducts.length > 0) {
      this.getRelatedProducts();
    }
  }

  private loadProducts() {
    this.http.get<Product[]>('assets/data/products.json').subscribe(data => {
      this.allProducts = data;
      console.log('RelatedProducts loaded:', this.allProducts.length, 'products');
      this.getRelatedProducts();
    });
  }

  private getRelatedProducts() {
    let products: Product[] = [];

    if (this.productIds.length > 0) {
      // Use specified product IDs
      products = this.allProducts.filter(p => 
        this.productIds.includes(p.id) && p.id !== this.currentProductId
      );
    } else if (this.currentProductId) {
      // Get related products from current product's relatedProducts array
      const currentProduct = this.allProducts.find(p => p.id === this.currentProductId);
      if (currentProduct && currentProduct.relatedProducts) {
        products = this.allProducts.filter(p => 
          currentProduct.relatedProducts!.includes(p.id)
        );
      }
    } else {
      // Get products by category or collection or random
      products = this.allProducts.filter(p => {
        if (this.category && (p as any).category !== this.category) return false;
        if (this.collection && (p as any).collection !== this.collection) return false;
        if (this.currentProductId && p.id === this.currentProductId) return false;
        return true;
      });
      
      // If no products found by category/collection, show random products
      if (products.length === 0) {
        products = this.allProducts.filter(p => p.id !== this.currentProductId);
      }
    }

    // Limit the number of items and randomize if needed
    if (products.length > this.maxItems) {
      // Shuffle array and take first maxItems
      products = products.sort(() => 0.5 - Math.random()).slice(0, this.maxItems);
    }

    this.relatedProducts = products;
    console.log('Related products found:', this.relatedProducts.length);
    console.log('Products data:', this.relatedProducts);
    this.createSlides();
  }

  private createSlides() {
    this.slides = [];
    for (let i = 0; i < this.relatedProducts.length; i += this.itemsPerSlide) {
      this.slides.push(this.relatedProducts.slice(i, i + this.itemsPerSlide));
    }
    this.totalSlides = this.slides.length;
    this.dots = Array.from({ length: this.totalSlides }, (_, i) => i);
    this.currentSlide = 0;
    console.log('Created slides:', this.slides.length, 'slides with', this.slides);
  }

  // Carousel navigation methods
  nextSlide() {
    if (this.currentSlide < this.totalSlides - 1) {
      this.currentSlide++;
    }
  }

  previousSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
    }
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }

  // Method to manually update related products
  updateRelatedProducts(productIds: number[]) {
    this.productIds = productIds;
    this.getRelatedProducts();
  }

  // Method to get related products by category
  getProductsByCategory(category: string, excludeId?: number) {
    this.category = category;
    this.currentProductId = excludeId;
    this.getRelatedProducts();
  }

  // Method to get random products
  getRandomProducts(count: number = 4, excludeId?: number) {
    const filteredProducts = this.allProducts.filter(p => p.id !== excludeId);
    this.relatedProducts = filteredProducts
      .sort(() => 0.5 - Math.random())
      .slice(0, count);
    this.createSlides();
  }
}