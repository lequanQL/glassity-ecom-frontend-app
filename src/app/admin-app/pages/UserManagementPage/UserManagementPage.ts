import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService, Customer } from '../../services/customer.service';

@Component({
  selector: 'user-management-page',
  templateUrl: './UserManagementPage.html',
  styleUrls: ['./UserManagementPage.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class UserManagementPage implements OnInit {
  private customerService = inject(CustomerService);
  
  customers = signal<Customer[]>([]);
  searchTerm: string = '';
  selectAll: boolean = false;
  selectedCustomers: Set<number> = new Set();

  ngOnInit(): void {
    this.loadCustomers();
  }

  private loadCustomers(): void {
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        // Add selected property for UI management
        const customersWithSelection = customers.map(customer => ({
          ...customer,
          selected: false
        }));
        this.customers.set(customersWithSelection);
        console.log('👥 Loaded customers for management:', customers.length);
      },
      error: (error) => {
        console.error('❌ Error loading customers:', error);
        this.customers.set([]);
      }
    });
  }

  get filteredCustomers(): Customer[] {
    if (!this.searchTerm.trim()) {
      return this.customers();
    }
    
    const term = this.searchTerm.toLowerCase();
    return this.customers().filter(customer => 
      customer.fullName.toLowerCase().includes(term) ||
      customer.email.toLowerCase().includes(term) ||
      customer.username.toLowerCase().includes(term) ||
      customer.phone.includes(term)
    );
  }

  toggleSelectAll() {
    const currentCustomers = this.customers();
    const updatedCustomers = currentCustomers.map(customer => ({
      ...customer,
      selected: this.selectAll
    }));
    this.customers.set(updatedCustomers);
    
    if (this.selectAll) {
      this.selectedCustomers = new Set(this.filteredCustomers.map(customer => customer.id));
    } else {
      this.selectedCustomers.clear();
    }
  }

  toggleCustomerSelection(customerId: number) {
    if (this.selectedCustomers.has(customerId)) {
      this.selectedCustomers.delete(customerId);
    } else {
      this.selectedCustomers.add(customerId);
    }
    
    // Update selectAll state
    this.selectAll = this.selectedCustomers.size === this.filteredCustomers.length;
    
    // Update customer selection state
    const currentCustomers = this.customers();
    const updatedCustomers = currentCustomers.map(customer => ({
      ...customer,
      selected: this.selectedCustomers.has(customer.id)
    }));
    this.customers.set(updatedCustomers);
  }

  deleteCustomer(customer: Customer) {
    if (confirm(`Are you sure you want to delete customer "${customer.fullName}"?`)) {
      this.customerService.deleteCustomer(customer.id).subscribe({
        next: (success) => {
          if (success) {
            console.log('✅ Customer deleted successfully:', customer.fullName);
            this.selectedCustomers.delete(customer.id);
            this.loadCustomers(); // Reload customers after deletion
          } else {
            console.error('❌ Failed to delete customer:', customer.fullName);
          }
        },
        error: (error) => {
          console.error('❌ Error deleting customer:', error);
        }
      });
    }
  }

  viewCustomerDetails(customer: Customer) {
    console.log('Viewing details for customer:', customer);
    // Implement customer details view logic here
    // Could open a modal or navigate to a detail page
  }

  exportCustomers() {
    const customersToExport = this.selectedCustomers.size > 0 
      ? this.customers().filter(c => this.selectedCustomers.has(c.id))
      : this.customers();
    
    console.log('Exporting customers...', customersToExport.length, 'customers');
    
    // Create CSV content
    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'City', 'Total Orders', 'Total Spent', 'Status', 'Membership Level'];
    const csvContent = [
      headers.join(','),
      ...customersToExport.map(c => [
        c.id,
        `"${c.fullName}"`,
        c.email,
        c.phone,
        `"${c.city}"`,
        c.totalOrders,
        c.totalSpent,
        c.status,
        c.membershipLevel
      ].join(','))
    ].join('\n');
    
    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}