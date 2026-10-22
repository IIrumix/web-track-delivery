import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { forkJoin, map } from 'rxjs';
import { Coordinates, DeliveryPlan, PlanningOrder, PlanningSettings, PreviewJobRoute, RouteLine } from '../model/delivery-response';

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
  // ให้หน้าแผนที่อ่านข้อมูลจาก service นี้ได้ แม้เปลี่ยนหน้าแล้วกลับมา
  readonly routeLines = signal<PreviewJobRoute[]>([]);
  readonly selectedJobIndex = signal<number | null>(null);
  readonly loadingRoutes = signal(false);
  // ล็อกปุ่มตั้งแต่ดึงออเดอร์/คำนวณ preview จนโหลดเส้นทางครบ
  readonly loadingPreview = signal(false);
  readonly isCreatingRoute = computed(() => this.loadingPreview() || this.loadingRoutes());
  readonly routeError = signal<string | null>(null);
  // เก็บแผนที่เคยแสดงไว้ใน service เพื่อขอแผนอื่นได้ต่อหลังเปลี่ยนหน้า
  readonly seenPlanSignatures = signal<string[]>([]);
  readonly planMessage = signal<string | null>(null);

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

  getRoute(points: Coordinates[]) {
    return this.http.post<RouteLine>('/api/job-sheets/route', { points });
  }

  loadRouteLines(preview: DeliveryPlan) {
    // ล้างเส้นของแผนเดิม เพื่อไม่ให้แผนที่นำไปใช้กับใบงานชุดใหม่
    this.routeLines.set([]);
    this.routeError.set(null);
    this.loadingRoutes.set(preview.jobs.length > 0);
    if (preview.jobs.length === 0) return;

    const requests = preview.jobs.map((job, jobIndex) => {
      // ส่งแยกทีละใบงาน: ร้าน → จุดส่งตามลำดับ → ร้าน (ถ้าเลือกกลับร้าน)
      const points = [
        preview.settings.origin,
        ...job.stops.map((stop) => ({
          latitude: stop.order.latitude,
          longitude: stop.order.longitude,
        })),
      ];
      if (preview.settings.return_to_shop) points.push(preview.settings.origin);

      return this.getRoute(points).pipe(map((line) => ({ jobIndex, line })));
    });

    // เก็บเมื่อครบทุกใบงาน โดย jobIndex ยังคงตรงกับลำดับการ์ด
    forkJoin(requests).subscribe({
      next: (routes) => {
        if (this.previewPlan() !== preview) return;
        this.routeLines.set(routes);
        this.loadingRoutes.set(false);
      },
      error: () => {
        if (this.previewPlan() !== preview) return;
        this.routeError.set('โหลดเส้นทางไม่ครบ กรุณาลองคำนวณแผนอีกครั้ง');
        this.loadingRoutes.set(false);
      },
    });
  }

  getPreviewPlan(
    orderIds: number[],
    deliveryDate: string,
    excludeSignatures: string[] = [],
    settings?: PlanningSettings,
  ) {
    const requestBody = {
      order_ids: orderIds,
      // ขอแผนอื่นต้องใช้เงื่อนไขเดียวกับ preview เดิม
      settings: settings ?? {
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
      exclude_signatures: excludeSignatures,
    };

    return this.http.post<DeliveryPlan>('/api/job-sheets/preview', requestBody);
  }

}
