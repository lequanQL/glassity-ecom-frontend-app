import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface ProductColor {
  name: string;
  code: string;
  image: string;
  stock: number;
}

export interface ProductSpecifications {
  lensWidth: number;
  bridgeWidth: number;
  templeLength: number;
  frameWidth: number;
  frameHeight: number;
  weight: string;
}

export interface ProductMaterials {
  frame: string;
  lens: string;
  temple: string;
}

export interface Product {
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
  materials: ProductMaterials;
  specifications: ProductSpecifications;
  features: string[];
  colors: ProductColor[];
  selected?: boolean; // For admin UI selection
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();

  constructor() {
    console.log('🚀 ProductService initializing...');
    // Only initialize data loading in browser environment
    if (isPlatformBrowser(this.platformId)) {
      console.log('🌐 Browser environment detected, loading products...');
      this.loadProducts();
    } else {
      console.log('🖥️ Server environment detected, skipping localStorage operations');
      // For SSR, just load from JSON file
      this.loadProductsFromJson();
    }
  }

  private loadProducts(): void {
    // Only access localStorage in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      this.loadProductsFromJson();
      return;
    }

    // Load products from localStorage first
    try {
      const localProducts = localStorage.getItem('products');
      if (localProducts) {
        const products = JSON.parse(localProducts);
        this.productsSubject.next(products);
        console.log('📦 Products loaded from localStorage:', products.length + ' products');
        return;
      }
    } catch (error) {
      console.error('❌ Error parsing products from localStorage:', error);
      try {
        localStorage.removeItem('products');
      } catch (removeError) {
        console.error('❌ Error removing corrupted localStorage data:', removeError);
      }
    }

    // Fallback to JSON file for initial seed data
    this.loadProductsFromJson();
  }

  private loadProductsFromJson(): void {
    console.log('📂 Loading initial product data from JSON file...');
    this.http.get<Product[]>('assets/data/products.json').subscribe({
      next: (products: Product[]) => {
        this.productsSubject.next(products);
        
        // Save to localStorage only in browser
        if (isPlatformBrowser(this.platformId)) {
          try {
            localStorage.setItem('products', JSON.stringify(products));
            console.log('📥 Product seed data loaded and saved to localStorage:', products.length + ' products');
          } catch (error) {
            console.error('❌ Error saving products to localStorage:', error);
          }
        } else {
          console.log('📥 Product seed data loaded (server-side):', products.length + ' products');
        }
      },
      error: (error: any) => {
        console.error('❌ Error loading products from JSON file:', error);
        this.productsSubject.next([]);
      }
    });
  }

  getProducts(): Observable<Product[]> {
    return this.products$;
  }

  addProduct(product: Product): Observable<Product> {
    return new Observable(observer => {
      const currentProducts = this.productsSubject.value;
      const newProduct = {
        ...product,
        id: this.generateNextId(currentProducts)
      };
      const updatedProducts = [...currentProducts, newProduct];
      
      // Update the local state immediately for UI responsiveness
      this.productsSubject.next(updatedProducts);
      
      // Save to localStorage (acts as our persistent database) - only in browser
      if (isPlatformBrowser(this.platformId)) {
        try {
          localStorage.setItem('products', JSON.stringify(updatedProducts));
          console.log('💾 Product saved to localStorage:', newProduct.code);
        } catch (error) {
          console.error('❌ Error saving product to localStorage:', error);
          // Revert the state if localStorage fails
          this.productsSubject.next(currentProducts);
          observer.error(error);
          return;
        }
      } else {
        console.log('💾 Product saved (server-side):', newProduct.code);
      }
      
      // Simulate realistic API delay
      setTimeout(() => {
        observer.next(newProduct);
        observer.complete();
      }, 300);
    });
  }

  updateProduct(updatedProduct: Product): Observable<Product | null> {
    return new Observable(observer => {
      const currentProducts = this.productsSubject.value;
      const productIndex = currentProducts.findIndex(product => product.id === updatedProduct.id);
      
      if (productIndex !== -1) {
        const updatedProducts = [...currentProducts];
        updatedProducts[productIndex] = updatedProduct;
        
        // Update the state
        this.productsSubject.next(updatedProducts);
        
        // Save to localStorage (persistent storage) - only in browser
        if (isPlatformBrowser(this.platformId)) {
          try {
            localStorage.setItem('products', JSON.stringify(updatedProducts));
            console.log(`💾 Product ${updatedProduct.code} updated and saved to localStorage`);
          } catch (error) {
            console.error('❌ Error saving product update to localStorage:', error);
          }
        } else {
          console.log(`💾 Product ${updatedProduct.code} updated (server-side)`);
        }
        
        observer.next(updatedProducts[productIndex]);
      } else {
        console.warn(`⚠️ Product ${updatedProduct.code} not found`);
        observer.next(null);
      }
      observer.complete();
    });
  }

  deleteProduct(productId: number): Observable<boolean> {
    return new Observable(observer => {
      const currentProducts = this.productsSubject.value;
      const productIndex = currentProducts.findIndex(product => product.id === productId);
      
      if (productIndex !== -1) {
        const updatedProducts = currentProducts.filter(product => product.id !== productId);
        
        // Update the state
        this.productsSubject.next(updatedProducts);
        
        // Save to localStorage (persistent storage) - only in browser
        if (isPlatformBrowser(this.platformId)) {
          try {
            localStorage.setItem('products', JSON.stringify(updatedProducts));
            console.log(`🗑️ Product ID ${productId} deleted and saved to localStorage`);
          } catch (error) {
            console.error('❌ Error saving product deletion to localStorage:', error);
          }
        } else {
          console.log(`🗑️ Product ID ${productId} deleted (server-side)`);
        }
        
        observer.next(true);
      } else {
        console.warn(`⚠️ Product ID ${productId} not found for deletion`);
        observer.next(false);
      }
      observer.complete();
    });
  }

  private generateNextId(products: Product[]): number {
    const maxId = products.reduce((max, product) => Math.max(max, product.id), 0);
    return maxId + 1;
  }
}