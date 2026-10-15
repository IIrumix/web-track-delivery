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
  readonly simulating = signal(false);

  ngOnInit() {
    this.getOrders();
  }

  async getOrders() {
    try {
      const response = await firstValueFrom(
        this.http.get<OrderResponse[]>('/api/orders/with-customers'),
      );
      this.orders.set(this.sortOrders(response));
    } catch (error) {
      console.error('เรียกข้อมูล orders ไม่สำเร็จ', error);
    }
  }

  selectOrder(order: OrderResponse) {
    this.orderSelection.select(order);
  }

  private sortOrders(orders: OrderResponse[]): OrderResponse[] {
    return [...orders].sort((first, second) => first.order_id - second.order_id);
  }

  async simulateOrders() {
    if (this.simulating()) return;

    this.simulating.set(true);
    try {
      await firstValueFrom(this.http.post('/api/orders/simulated', null));
      await this.getOrders();
    } catch (error) {
      console.error('สร้าง simulated orders ไม่สำเร็จ', error);
    } finally {
      this.simulating.set(false);
    }
  }

}
