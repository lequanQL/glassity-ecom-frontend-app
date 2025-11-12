import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ProductFormData {
  name1: string;
  name2: string;
  color: string;
  frameMaterial: string;
  lensMaterial: string;
  price: number | null;
  stock: number | null;
  images: File[];
  description: string;
}

@Component({
  selector: 'add-product-modal',
  templateUrl: './AddProductModal.html',
  styleUrls: ['./AddProductModal.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AddProductModal {
  @Input() isVisible: boolean = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onProductAdd = new EventEmitter<ProductFormData>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  product: ProductFormData = {
    name1: '',
    name2: '',
    color: '',
    frameMaterial: '',
    lensMaterial: '',
    price: null,
    stock: null,
    images: [],
    description: ''
  };

  closeModal() {
    this.isVisible = false;
    this.resetForm();
    this.onClose.emit();
  }

  selectImages() {
    this.fileInput.nativeElement.click();
  }

  onImagesSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      this.product.images = Array.from(target.files);
    }
  }

  onSubmit() {
    if (this.isFormValid()) {
      this.onProductAdd.emit({ ...this.product });
      this.closeModal();
    }
  }

  private isFormValid(): boolean {
    return !!(
      this.product.name1 &&
      this.product.name2 &&
      this.product.color &&
      this.product.frameMaterial &&
      this.product.lensMaterial &&
      this.product.price &&
      this.product.stock &&
      this.product.description &&
      this.product.images.length > 0
    );
  }

  private resetForm() {
    this.product = {
      name1: '',
      name2: '',
      color: '',
      frameMaterial: '',
      lensMaterial: '',
      price: null,
      stock: null,
      images: [],
      description: ''
    };
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
}