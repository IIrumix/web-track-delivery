import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { DeliveryPlan, PlanningOrder } from '../model/delivery-response';

@Injectable({
  providedIn: 'root',
})
export class RouteService {
  confirmRoute = signal(false);
  createRoute = signal(false);
  // เก็บแผนใน root service เพื่อให้เปลี่ยนหน้าแล้วข้อมูลยังอยู่
  readonly previewPlan = signal<DeliveryPlan | null>(null);
  // อ่านใบงานจากแผนโดยตรง ไม่ต้องเก็บและอัปเดต list ซ้ำอีกชุด
  readonly jobs = computed(() => this.previewPlan()?.jobs ?? []);

  constructor(private http: HttpClient) {}

  toggleConfirmRoute() {
    this.confirmRoute.update((current) => !current);
  }

  toggleCreateRoute() {
    this.createRoute.update((current) => !current);
  }

  getEligibleJobs(date: string) {

    return this.http.get<PlanningOrder[]>(`/api/job-sheets/eligible-orders?date=${date}`);
  }

  getPreviewPlan(orderIds: number[], deliveryDate: string) {
    const requestBody = {
      order_ids: orderIds,
      settings: {
        delivery_date: deliveryDate,
        origin: {
          latitude: 16.246063,
          longitude: 103.252125,
        },
        departure_time: '11:30',
        deadline_time: '12:30',
        speed_kmh: 30,
        service_minutes: 2,
        fixed_cost: 15,
        cost_per_km_per_box: 2,
        return_to_shop: false,
      },
      exclude_signatures: [],
    };

    return this.http.post<DeliveryPlan>('/api/job-sheets/preview', requestBody);
  }
}
