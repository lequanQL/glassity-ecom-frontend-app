import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'admin-header',
  templateUrl: './AdminHeader.html',
  styleUrls: ['./AdminHeader.css'],
  standalone: true,
  imports: [CommonModule]
})
export class AdminHeader {
  @Input() pageTitle: string = 'Admin Panel';
  notificationCount: number = 3; // Example notification count
}