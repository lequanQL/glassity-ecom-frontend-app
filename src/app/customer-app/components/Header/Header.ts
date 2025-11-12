import { Component, Injectable, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PersonalInfo } from '../PersonalInfo/PersonalInfo';
import { Cart } from '../Cart/Cart';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { PLATFORM_ID, Inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'app-header',
  templateUrl: './Header.html',
  styleUrl: './Header.css',
  standalone: true,
  imports: [CommonModule, RouterLink, PersonalInfo, Cart]
})
export class Header implements OnInit, OnDestroy {
  isCartOpen = false;
  isCartDrawerOpen = false;
  isUserMenuOpen = false;
  private clickListener: ((event: Event) => void) | null = null;
  
  public authService = inject(AuthService);

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public cartService: CartService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.clickListener = (event: Event) => {
        const target = event.target as HTMLElement;
        const cartDropdown = document.querySelector('.cart.dropdown');
        const userMenu = document.querySelector('.user-menu');
        
        if (cartDropdown && !cartDropdown.contains(target)) {
          this.isCartOpen = false;
        }
        
        if (userMenu && !userMenu.contains(target)) {
          this.isUserMenuOpen = false;
        }
      };
      document.addEventListener('click', this.clickListener);
    }
  }

  ngOnDestroy() {
    if (this.clickListener && isPlatformBrowser(this.platformId)) {
      document.removeEventListener('click', this.clickListener);
    }
  }

  scrollToFooter() {
    if (isPlatformBrowser(this.platformId)) {
      const footer = document.getElementById('footer');
      footer?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  toggleCart(event: Event) {
    event.stopPropagation();
    this.isCartOpen = !this.isCartOpen;
  }

  toggleCartDrawer() {
    this.isCartDrawerOpen = !this.isCartDrawerOpen;
  }

  closeCartDrawer() {
    this.isCartDrawerOpen = false;
  }

  toggleUserMenu(event: Event) {
    event.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu() {
    this.isUserMenuOpen = false;
  }
}