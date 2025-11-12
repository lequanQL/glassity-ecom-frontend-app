import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../Header/Header';
import { Footer } from '../Footer/Footer';

@Component({
  selector: 'default-layout',
  template: `
    <div class="default-layout">
      <app-header></app-header>
      <div class="main-content">
        <router-outlet></router-outlet>
      </div>
      <div class="footer-wrapper">
        <app-footer></app-footer>
      </div>
    </div>
  `,
  styleUrl: './DefaultLayout.css',
  standalone: true,
  imports: [RouterOutlet, Header, Footer]
})
export class DefaultLayout {}