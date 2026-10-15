import { Component, inject } from '@angular/core';
import { Router,RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { CustomerDetailPanel } from '../owner-page/customer/customer-detail-panel/customer-detail-panel';
import { CustomerMap } from '../owner-page/customer/customer-map';
import { CustomerStore } from '../owner-page/customer/customer-store';
@Component({
  imports: [RouterOutlet,Sidebar,CustomerDetailPanel,CustomerMap],
  providers: [CustomerStore],
  selector: 'app-owener-layout',
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
