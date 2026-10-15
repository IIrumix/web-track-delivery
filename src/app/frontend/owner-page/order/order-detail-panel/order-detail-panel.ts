import { Component, Input, inject } from '@angular/core';
import { OrderSelectionService } from '../../../../service/order-selection.service';

@Component({
  imports: [],
  selector: 'app-order-detail-panel',
  styleUrl: './order-detail-panel.css',
  templateUrl: './order-detail-panel.html',
})
export class OrderDetailPanel {
  @Input() selectedData: unknown = null;
  private readonly orderSelection = inject(OrderSelectionService);
  readonly order = this.orderSelection.selectedOrder;

  get profit(): number {
    const order = this.order();
    if (!order) return 0;

    return (+order.unit_price - +order.unit_cost) * order.quantity;
  }
}
