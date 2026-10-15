import { Component, inject } from '@angular/core';
import { Router,RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { CustomerDetailPanel } from '../owner-page/customer/customer-detail-panel/customer-detail-panel';
@Component({
  imports: [RouterOutlet,Sidebar,CustomerDetailPanel],
  selector: 'app-owener-layout',
  styleUrl: './owener-layout.css',
  templateUrl: './owener-layout.html',
})
export class OwenerLayout {
  router = inject(Router);
  selectedItem: any;

  updateSelected(item: any) {
    this.selectedItem = item;
  } 
  

}
