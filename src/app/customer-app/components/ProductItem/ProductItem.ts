import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { PriceFormatPipe } from '../../pipes/price.pipe';

@Component({
  selector: 'product-item',
  templateUrl: './ProductItem.html',
  styleUrl: './ProductItem.css',
  imports: [CommonModule, RouterLink, PriceFormatPipe],
  standalone: true
})
export class ProductItem {
  @Input() img = '';
  @Input() code = '';
  @Input() price?: number;
  @Input() id: number = 1;

  hasPrice(): boolean {
    return this.price !== undefined && this.price !== null;
  }
}
