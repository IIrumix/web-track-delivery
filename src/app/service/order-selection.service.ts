import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { OrderResponse } from '../model/order-response';
import { firstValueFrom, Subject } from 'rxjs';

@Injectable()
export class OrderSelectionService {
  readonly selectedOrder = signal<OrderResponse | null>(null);
  readonly orders = signal<OrderResponse[]>([]);
  changes = new Subject<string>();

  constructor(private http: HttpClient) {}

  // โหลดครั้งเดียวแล้วใช้ข้อมูลชุดเดียวกันทั้งรายชื่อและแผนที่
  async loadOrders(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<OrderResponse[]>('/api/orders/with-customers'),
      );
      this.setOrders(response);
    } catch (error) {
      console.error('เรียกข้อมูล orders ไม่สำเร็จ', error);
    }
  }

  setOrders(orders: OrderResponse[]) {
    this.orders.set(
      [...orders].sort((first, second) => first.order_id - second.order_id),
    );
    this.changes.next('loaded');
  }

  select(order: OrderResponse) {
    this.selectedOrder.set(order);
    this.changes.next('selected');
  }

  // ค่าว่างและพิกัดที่ผิดจะไม่ถูกนำไปสร้างหมุด
  getCoordinates(order: OrderResponse): [number, number] | null {
    if (order.latitude == null || order.longitude == null) return null;
    if (String(order.latitude).trim() === '' || String(order.longitude).trim() === '') return null;
    const latitude = Number(order.latitude);
    const longitude = Number(order.longitude);
    if (!Number.isFinite(latitude) || Math.abs(latitude) > 90) return null;
    if (!Number.isFinite(longitude) || Math.abs(longitude) > 180) return null;
    return [latitude, longitude];
  }
}
