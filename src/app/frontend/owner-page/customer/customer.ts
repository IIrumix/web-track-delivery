import { Component, inject } from '@angular/core';
import { CustomerStore } from './customer-store';

@Component({
  imports: [],
  selector: 'app-customer',
  styleUrl: './customer.css',
  templateUrl: './customer.html',
  host: { class: 'block w-3/4 h-full' },
})
export class Customer {
  readonly store = inject(CustomerStore);
}
