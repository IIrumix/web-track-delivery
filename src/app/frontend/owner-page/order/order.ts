import { Component, inject } from '@angular/core';
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
  private readonly orderSelection = inject(OrderSelectionService);
  readonly orders = this.orderSelection.orders;

  ngOnInit() {
    this.orderSelection.loadOrders();
  }

  selectOrder(order: OrderResponse) {
    this.orderSelection.select(order);
  }
}
