import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ProductItem } from '../../components/ProductItem/ProductItem';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'home-page',
  templateUrl: './HomePage.html',
  styleUrl: './HomePage.css',
  standalone: true,
  imports: [ProductItem, CommonModule, RouterLink]
})
export class HomePage implements OnInit, OnDestroy {
  products = [
    'assets/images/homepage/sp1.png',
    'assets/images/homepage/sp2.png',
    'assets/images/homepage/sp3.png',
    'assets/images/homepage/sp4.png'
  ];

  // Carousel properties
  currentTopSlide = 0;
  currentBottomSlide = 0;
  topSlideInterval: any;
  bottomSlideInterval: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    // Only start intervals on browser platform
    if (isPlatformBrowser(this.platformId)) {
      // Auto-slide for top carousel every 5 seconds
      this.topSlideInterval = setInterval(() => {
        this.nextTopSlide();
      }, 5000);

      // Auto-slide for bottom carousel every 3 seconds
      this.bottomSlideInterval = setInterval(() => {
        this.nextBottomSlide();
      }, 3000);
    }
  }

  ngOnDestroy() {
    if (this.topSlideInterval) {
      clearInterval(this.topSlideInterval);
    }
    if (this.bottomSlideInterval) {
      clearInterval(this.bottomSlideInterval);
    }
  }

  // Top carousel methods
  nextTopSlide() {
    this.currentTopSlide = (this.currentTopSlide + 1) % 2; // 2 images in top folder
  }

  goToTopSlide(index: number) {
    this.currentTopSlide = index;
  }

  // Bottom carousel methods
  nextBottomSlide() {
    this.currentBottomSlide = (this.currentBottomSlide + 1) % 5; // 5 images in bottom folder
  }

  previousBottomSlide() {
    this.currentBottomSlide = this.currentBottomSlide === 0 ? 4 : this.currentBottomSlide - 1;
  }

  goToBottomSlide(index: number) {
    this.currentBottomSlide = index;
  }
}
