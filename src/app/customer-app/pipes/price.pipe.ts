import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'priceFormat',
  standalone: true
})
export class PriceFormatPipe implements PipeTransform {
  transform(value: number): string {
    if (value === null || value === undefined) return '';
    
    // Convert number to string with thousand separators
    const formattedPrice = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    
    // Add 'đ' at the end
    return `${formattedPrice}đ`;
  }
}