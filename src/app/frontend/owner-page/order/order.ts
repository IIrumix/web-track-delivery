import { Component, computed, inject, signal } from '@angular/core';
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
  readonly searchQuery = signal('');
  readonly filteredOrders = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) return this.orders();

    return this.orders().filter(
      (order) =>
        `order #${order.order_id}`.includes(query) ||
        (order.name ?? '').toLowerCase().includes(query),
    );
  });
  readonly simulating = signal(false);
  readonly deletingOrderId = signal<number | null>(null);

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

  async deleteOrder(order: OrderResponse) {
    const confirmed = window.confirm(`ยืนยันการลบ Order #${order.order_id} หรือไม่?`);
    if (!confirmed || this.deletingOrderId() !== null) return;

    this.deletingOrderId.set(order.order_id);
    try {
      await firstValueFrom(this.http.delete(`/api/orders/${order.order_id}`));
      if (this.orderSelection.selectedOrder()?.order_id === order.order_id) {
        this.orderSelection.clearSelection();
      }
      await this.orderSelection.loadOrders();
    } catch (error) {
      console.error(`ลบ Order #${order.order_id} ไม่สำเร็จ`, error);
    } finally {
      this.deletingOrderId.set(null);
    }
  }

}
