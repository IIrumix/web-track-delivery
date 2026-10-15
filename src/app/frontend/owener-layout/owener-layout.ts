import { Component, inject } from '@angular/core';
import { Router,RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { DetailPanel } from '../detail-panel/detail-panel';

@Component({
  imports: [RouterOutlet,Sidebar,DetailPanel],
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
