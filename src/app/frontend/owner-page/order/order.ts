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
  host: { class: 'block w-3/4 h-full' },
})
export class Order {
  private readonly http = inject(HttpClient);
  private readonly orderSelection = inject(OrderSelectionService);
  readonly orders = signal<OrderResponse[]>([]);

  ngOnInit() {
    this.getOrders();
  }

  async getOrders() {
    try {
      const response = await firstValueFrom(
        this.http.get<OrderResponse[]>('/api/orders/with-customers'),
      );
      this.orders.set(response);
      this.orderSelection.setOrders(response);
    } catch (error) {
      console.error('เรียกข้อมูล orders ไม่สำเร็จ', error);
    }
  }

  selectOrder(order: OrderResponse) {
    this.orderSelection.select(order);
  }
}
