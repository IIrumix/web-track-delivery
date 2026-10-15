import { Component, inject } from '@angular/core';
import { Router,RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { CustomerMap } from '../owner-page/customer/customer-map';
import { CustomerStore } from '../owner-page/customer/customer-store';
import { OrderDetailPanel } from '../owner-page/order/order-detail-panel/order-detail-panel';
@Component({
  imports: [RouterOutlet, Sidebar, CustomerMap, OrderDetailPanel],
  providers: [CustomerStore],
  selector: 'app-owner-layout',
  styleUrl: './owner-layout.css',
  templateUrl: './owner-layout.html',
})
export class OwnerLayout {
  router = inject(Router);
  selectedItem: any;

  updateSelected(item: any) {
    this.selectedItem = item;
  } 
  

}
