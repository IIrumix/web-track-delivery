import { Component, inject } from '@angular/core';
import { Router,RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { CustomerDetailPanel } from '../owner-page/customer/customer-detail-panel/customer-detail-panel';
@Component({
  imports: [RouterOutlet,Sidebar,CustomerDetailPanel],
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
