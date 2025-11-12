import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ProductItem } from '../../components/ProductItem/ProductItem';
import { RelatedProductsComponent } from '../../components/RelatedProducts/RelatedProducts';

@Component({
  selector: 'products-page',
  templateUrl: './ProductsPage.html',
  styleUrl: './ProductsPage.css',
  imports: [CommonModule, ProductItem, RelatedProductsComponent]
})
export class ProductsPage {
  products: any[] = [];
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('assets/data/products.json').subscribe(data => {
      this.products = data;
    });
  }
}
