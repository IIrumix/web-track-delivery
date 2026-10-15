import { Component, Input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-order-detail-panel',
  styleUrl: './order-detail-panel.css',
  templateUrl: './order-detail-panel.html',
})
export class OrderDetailPanel {
  @Input() selectedData: any = null;

  orderNumber: string = '1';
  customerName: string = 'llrumix (บ้านเลขที่ 1234)';
  foodItem: string = 'มันฝรั่งอบกรอบ หน้าแซลมอนรมควัน และ คาเวียร์ x2';
  quantity: number = 2;
  profit: number = 50;
}
