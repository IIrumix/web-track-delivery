import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { OrderSelectionService } from '../../../service/order-selection.service';
import { OrderResponse } from '../../../model/order-response';

@Component({
  imports: [],
  selector: 'app-order',
  styleUrl: './order.css',
  templateUrl: './order.html',
  host: { class: 'block w-full h-full' },
})
export class Order {
  private readonly http = inject(HttpClient);
  private readonly orderSelection = inject(OrderSelectionService);
  readonly orders = this.orderSelection.orders;
  readonly simulating = signal(false);

  ngOnInit() {
    this.orderSelection.loadOrders();
  }

  selectOrder(order: OrderResponse) {
    this.orderSelection.select(order);
  }

  async simulateOrders() {
    if (this.simulating()) return;

    this.simulating.set(true);
    try {
      await firstValueFrom(this.http.post('/api/orders/simulated', null));
      await this.orderSelection.loadOrders();
    } catch (error) {
      console.error('สร้าง simulated orders ไม่สำเร็จ', error);
    } finally {
      this.simulating.set(false);
    }
  }

}
