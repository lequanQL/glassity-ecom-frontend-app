import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../Sidebar/Sidebar';
import { AdminHeader } from '../AdminHeader/AdminHeader';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'admin-layout',
  templateUrl: './AdminLayout.html',
  styleUrls: ['./AdminLayout.css'],
  standalone: true,
  imports: [CommonModule, RouterOutlet, Sidebar, AdminHeader]
})
export class AdminLayout implements OnInit, OnDestroy {
  pageTitle: string = 'Admin Panel';
  private routeSubscription: Subscription = new Subscription();

  constructor(private router: Router) {
    // Set initial page title
    this.updatePageTitle();
  }

  ngOnInit() {
    // Subscribe to route changes
    this.routeSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updatePageTitle();
      });
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  private updatePageTitle() {
    const url = this.router.url;
    if (url.includes('/admin/products')) {
      this.pageTitle = 'Product Management';
    } else if (url.includes('/admin/orders')) {
      this.pageTitle = 'Order Management';
    } else if (url.includes('/admin/users')) {
      this.pageTitle = 'Customer Management';
    } else {
      this.pageTitle = 'Admin Panel';
    }
  }
}