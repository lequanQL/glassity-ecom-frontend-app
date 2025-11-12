import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ProductItem } from '../../components/ProductItem/ProductItem';
import { RelatedProductsComponent } from '../../components/RelatedProducts/RelatedProducts';

interface CollectionInfo {
  name: string;
  displayName: string;
  description: string;
  image: string;
  slug: string;
}

@Component({
  selector: 'collection-page',
  templateUrl: './CollectionPage.html',
  styleUrl: './CollectionPage.css',
  imports: [CommonModule, ProductItem, RelatedProductsComponent]
})
export class CollectionPage implements OnInit {
  products: any[] = [];
  allProducts: any[] = [];
  
  // Dynamic collections data
  collectionsWithProducts: {
    collection: CollectionInfo;
    products: any[];
    featuredProducts: any[];
    additionalProducts: any[];
  }[] = [];

  currentCollection: CollectionInfo = {
    name: 'Best Seller',
    displayName: 'Best Seller Collection',
    description: 'Our most popular frames that customers love',
    image: 'assets/images/collection_page/summer.png',
    slug: 'best-seller'
  };

  // Available collections metadata
  collectionsMetadata: { [key: string]: CollectionInfo } = {
    'Best Seller': {
      name: 'Best Seller',
      displayName: 'Best Seller Collection', 
      description: 'Our most popular frames that customers love worldwide',
      image: 'assets/images/collection_page/summer.png',
      slug: 'best-seller'
    },
    'Special Edition': {
      name: 'Special Edition',
      displayName: 'Special Edition Collection',
      description: 'Limited edition frames with unique designs and premium materials',
      image: 'assets/images/collection_page/summer.png', 
      slug: 'special-edition'
    }
  };

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Load all products data
    this.http.get<any[]>('assets/data/products.json').subscribe(data => {
      this.allProducts = data;
      this.organizeCollections();
    });
  }

  private organizeCollections() {
    // Get unique collections from products
    const uniqueCollections = [...new Set(this.allProducts.map(p => p.collection))];
    
    this.collectionsWithProducts = uniqueCollections.map(collectionName => {
      const products = this.allProducts.filter(p => p.collection === collectionName);
      const collection = this.collectionsMetadata[collectionName] || {
        name: collectionName,
        displayName: collectionName,
        description: `Products from ${collectionName} collection`,
        image: 'assets/images/collection_page/summer.png',
        slug: collectionName.toLowerCase().replace(/\s+/g, '-')
      };

      return {
        collection,
        products: products.slice(0, 6), // Limit to 6 products per collection
        featuredProducts: products.slice(0, 4),
        additionalProducts: products.slice(4, 6)
      };
    });

    // Set the first collection as current for hero section
    if (this.collectionsWithProducts.length > 0) {
      this.currentCollection = this.collectionsWithProducts[0].collection;
    }

    console.log('Organized collections:', this.collectionsWithProducts);
  }

  // Get products for display in different sections (keeping for compatibility)
  getFeaturedProducts() {
    const currentCollectionData = this.collectionsWithProducts.find(c => 
      c.collection.name === this.currentCollection.name
    );
    return currentCollectionData ? currentCollectionData.featuredProducts : [];
  }

  getAdditionalProducts() {
    const currentCollectionData = this.collectionsWithProducts.find(c => 
      c.collection.name === this.currentCollection.name
    );
    return currentCollectionData ? currentCollectionData.additionalProducts : [];
  }

  // Check if we have products to display
  hasProducts() {
    return this.collectionsWithProducts.length > 0;
  }

  hasFeaturedProducts() {
    return this.getFeaturedProducts().length > 0;
  }

  hasAdditionalProducts() {
    return this.getAdditionalProducts().length > 0;
  }
}
