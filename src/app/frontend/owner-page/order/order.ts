import { Component, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
  private addOrder = false;
  private editError = false;
  private saving = false;
  readonly orders = this.orderSelection.orders;
  readonly simulating = signal(false);
  readonly deletingOrderId = signal<number | null>(null);
  readonly deleteError = signal('');
  readonly deleteNotice = signal('');

  ngOnInit() {
    this.orderSelection.loadOrders();
  }

  selectOrder(order: OrderResponse) {
    this.orderSelection.select(order);
  }

  async deleteOrder(order: OrderResponse): Promise<void> {
    if (this.deletingOrderId() !== null || this.simulating()) return;
    if (!window.confirm(`ลบออเดอร์ #${order.order_id} ของ ${order.name} จำนวน ${order.quantity} กล่อง?\nเมื่อลบแล้วจะกู้คืนไม่ได้`)) return;

    this.deletingOrderId.set(order.order_id);
    this.deleteError.set('');
    this.deleteNotice.set('');
    try {
      await this.orderSelection.deleteOrder(order.order_id);
      this.deleteNotice.set(`ลบออเดอร์ #${order.order_id} แล้ว`);
    } catch (error) {
      const status = error instanceof HttpErrorResponse ? error.status : null;
      this.deleteError.set(
        status === 409
          ? 'ออเดอร์นี้มีใบงานแล้ว ไม่สามารถลบได้'
          : status === 404
            ? 'ไม่พบออเดอร์นี้ อาจถูกลบไปแล้ว กรุณาโหลดหน้าใหม่'
            : 'ลบออเดอร์ไม่สำเร็จ กรุณาลองอีกครั้ง',
      );
    } finally {
      this.deletingOrderId.set(null);
    }
  }

  async simulateOrders() {
    if (this.simulating() || this.deletingOrderId() !== null) return;

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

  toggleAddOrder(){
    this.addOrder = !this.addOrder;
  }

}
