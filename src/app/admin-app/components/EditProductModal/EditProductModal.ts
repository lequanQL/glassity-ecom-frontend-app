import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../services/product.service';

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
  category: string;
  collection: string;
  status: string;
}

@Component({
  selector: 'edit-product-modal',
  templateUrl: './EditProductModal.html',
  styleUrls: ['./EditProductModal.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class EditProductModal implements OnChanges {
  @Input() isVisible: boolean = false;
  @Input() productToEdit: Product | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onProductUpdate = new EventEmitter<Product>();
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
    description: '',
    category: '',
    collection: '',
    status: ''
  };

  categories = [
    'Prescription Glasses',
    'Sunglasses',
    'Blue Light Glasses'
  ];

  collections = [
    'Fresh Summer',
    'Urban Classic',
    'Vintage Collection',
    'Modern Style',
    'Admin Added'
  ];

  statusOptions = [
    'In Stock',
    'Out of Stock',
    'Low Stock'
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productToEdit'] && this.productToEdit) {
      this.loadProductData();
    }
  }

  private loadProductData(): void {
    if (!this.productToEdit) return;

    const nameParts = this.productToEdit.fullName.split(' ');
    this.product = {
      name1: this.productToEdit.name || '',
      name2: nameParts.slice(1).join(' ') || '',
      color: this.productToEdit.colors[0]?.name || '',
      frameMaterial: this.productToEdit.materials?.frame || '',
      lensMaterial: this.productToEdit.materials?.lens || '',
      price: this.productToEdit.price,
      stock: this.productToEdit.stock,
      images: [],
      description: this.productToEdit.description || '',
      category: this.productToEdit.category || '',
      collection: this.productToEdit.collection || '',
      status: this.productToEdit.status || ''
    };
  }

  closeModal() {
    this.isVisible = false;
    this.resetForm();
    this.onClose.emit();
  }

  selectImages() {
    this.fileInput.nativeElement.click();
  }

  onImageSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      this.product.images = Array.from(target.files);
    }
  }

  removeImage(index: number) {
    this.product.images.splice(index, 1);
  }

  saveProduct() {
    if (!this.productToEdit) return;

    // Validate required fields
    if (!this.product.name1 || !this.product.price || !this.product.stock) {
      alert('Please fill in all required fields (Name 1, Price, Stock)');
      return;
    }

    // Create updated product object
    const updatedProduct: Product = {
      ...this.productToEdit,
      name: this.product.name1,
      fullName: `${this.product.name1} ${this.product.name2}`.trim(),
      price: this.product.price!,
      originalPrice: this.product.price! + 50000, // Add markup
      stock: this.product.stock!,
      category: this.product.category,
      collection: this.product.collection,
      status: this.product.status,
      description: this.product.description,
      materials: {
        ...this.productToEdit.materials,
        frame: this.product.frameMaterial || this.productToEdit.materials.frame,
        lens: this.product.lensMaterial || this.productToEdit.materials.lens
      },
      colors: [
        {
          ...this.productToEdit.colors[0],
          name: this.product.color || this.productToEdit.colors[0]?.name,
          stock: this.product.stock!
        }
      ]
    };

    this.onProductUpdate.emit(updatedProduct);
    this.closeModal();
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
      description: '',
      category: '',
      collection: '',
      status: ''
    };
  }
}