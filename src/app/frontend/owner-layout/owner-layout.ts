import { Component, inject } from '@angular/core';
import { Router,RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { CustomerDetailPanel } from '../owner-page/customer/customer-detail-panel/customer-detail-panel';
import { CustomerStore } from '../owner-page/customer/customer-store';
import { OrderSelectionService } from '../../service/order-selection.service';
import { OrderDetailPanel } from '../owner-page/order/order-detail-panel/order-detail-panel';
@Component({
  imports: [RouterOutlet, Sidebar, CustomerDetailPanel, OrderDetailPanel],
  providers: [CustomerStore, OrderSelectionService],
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
