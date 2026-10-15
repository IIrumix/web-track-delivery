import { Injectable, signal } from '@angular/core';
import { OrderResponse } from '../model/order-response';
import { Subject } from 'rxjs';

@Injectable()
export class OrderSelectionService {
  readonly selectedOrder = signal<OrderResponse | null>(null);
  orders: OrderResponse[] = [];
  changes = new Subject<string>();

  setOrders(orders: OrderResponse[]) {
    this.orders = orders;
    this.changes.next('loaded');
  }

  select(order: OrderResponse) {
    this.selectedOrder.set(order);
    this.changes.next('selected');
  }
}
