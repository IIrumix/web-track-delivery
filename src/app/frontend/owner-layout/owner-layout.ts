import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { CustomerDetailPanel } from '../owner-page/customer/customer-detail-panel/customer-detail-panel';
import { CustomerService } from '../../service/customer.service';
import { OrderSelectionService } from '../../service/order-selection.service';
import { OrderDetailPanel } from '../owner-page/order/order-detail-panel/order-detail-panel';
import { RiderDetailPage } from '../owner-page/rider/rider-detail-page/rider-detail-page';
@Component({
  imports: [RouterOutlet, Sidebar, CustomerDetailPanel, OrderDetailPanel, RouterLinkWithHref, RiderDetailPage],
  providers: [CustomerService, OrderSelectionService],
  selector: 'app-owner-layout',
  styleUrl: './owner-layout.css',
  templateUrl: './owner-layout.html',
})
export class OwnerLayout {
  router = inject(Router);
  selectedItem: any;
  openlist = true;

  updateSelected(item: any) {
    this.selectedItem = item;
  } 
  
  ToggleOpenlist(){
    this.openlist = !this.openlist;
  }

}
