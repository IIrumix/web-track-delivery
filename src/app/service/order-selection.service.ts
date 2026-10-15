import { Injectable, signal } from '@angular/core';
import { OrderResponse } from '../model/order-response';

@Injectable()
export class OrderSelectionService {
  readonly selectedOrder = signal<OrderResponse | null>(null);

  select(order: OrderResponse) {
    this.selectedOrder.set(order);
  }
}
