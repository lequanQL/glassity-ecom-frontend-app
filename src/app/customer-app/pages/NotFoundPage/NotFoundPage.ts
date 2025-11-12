import { CommonModule, ViewportScroller } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'not-found-page',
  templateUrl: './NotFoundPage.html',
  styleUrl: './NotFoundPage.css',
  imports: [CommonModule],
})
export class NotFoundPage {
  viewportScroller = inject(ViewportScroller);
  private router = inject(Router);

  goToHome() {
        this.router.navigate(['/']).then(() => {
      this.viewportScroller.scrollToPosition([0, 0]);
    });
  }
}
