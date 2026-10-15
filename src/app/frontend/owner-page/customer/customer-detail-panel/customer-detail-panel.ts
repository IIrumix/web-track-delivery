import { Component, Input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-customer-detail-panel',
  styleUrl: './customer-detail-panel.css',
  templateUrl: './customer-detail-panel.html',
})
export class CustomerDetailPanel {
  @Input() selectedData: any = null;

  orderNumber: string = '1';
  customerName: string = 'llrumix (บ้านเลขที่ 1234)';
  foodItem: string = 'มันฝรั่งอบกรอบ หน้าแซลมอนรมควัน และ คาเวียร์ x2';
  quantity: number = 2;
  profit: number = 50;

}
