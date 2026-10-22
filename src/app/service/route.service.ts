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
  readonly loadingRoutes = signal(false);
  // ล็อกปุ่มตั้งแต่ดึงออเดอร์/คำนวณ preview จนโหลดเส้นทางครบ
  readonly loadingPreview = signal(false);
  readonly isCreatingRoute = computed(() => this.loadingPreview() || this.loadingRoutes());
  readonly routeError = signal<string | null>(null);
  // เก็บแผนที่เคยแสดงไว้ใน service เพื่อขอแผนอื่นได้ต่อหลังเปลี่ยนหน้า
  readonly seenPlanSignatures = signal<string[]>([]);
  readonly planMessage = signal<string | null>(null);

  constructor(private http: HttpClient) {

    // เรียกใช้ข้อมูลจำลองทันทีตอนเปิดแอป (ลบออกได้เมื่อต่อ API จริง)
    this.loadMockData();

  }

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

  loadMockData() {
    const origin = {
      latitude: 16.246063,
      longitude: 103.252125,
    };

    const mockPlan: DeliveryPlan = {
      settings: {
        delivery_date: '2026-10-22',
        origin,
        departure_time: '11:30',
        deadline_time: '12:30',
        speed_kmh: 30,
        service_minutes: 2,
        fixed_cost: 15,
        cost_per_km_per_box: 2,
        return_to_shop: false,
      },
      jobs: [
        {
          // ใบงานที่ 1 (เส้นสีน้ำเงิน) - 2 จุดส่ง
          stops: [
            {
              order: {
                order_id: 101,
                latitude: 16.2495,
                longitude: 103.2485,
              },
            },
            {
              order: {
                order_id: 102,
                latitude: 16.2535,
                longitude: 103.2445,
              },
            },
          ],
        },
        {
          // ใบงานที่ 2 (เส้นสีแดง) - 2 จุดส่ง
          stops: [
            {
              order: {
                order_id: 103,
                latitude: 16.2432,
                longitude: 103.2568,
              },
            },
            {
              order: {
                order_id: 104,
                latitude: 16.2395,
                longitude: 103.2612,
              },
            },
          ],
        },
      ],
    } as unknown as DeliveryPlan;

    // จำลองเส้นทาง (GeoJSON coordinates ใช้รูปแบบ [longitude, latitude])
    const mockRoutes: PreviewJobRoute[] = [
      {
        jobIndex: 0,
        line: {
          coordinates: [
            [103.252125, 16.246063], // จุดเริ่มต้น (ร้าน)
            [103.2508, 16.2472],
            [103.2498, 16.2483],
            [103.2485, 16.2495],   // จุดส่งที่ 1 (Order #101)
            [103.2468, 16.2512],
            [103.2445, 16.2535],   // จุดส่งที่ 2 (Order #102)
          ],
        } as unknown as RouteLine,
      },
      {
        jobIndex: 1,
        line: {
          coordinates: [
            [103.252125, 16.246063], // จุดเริ่มต้น (ร้าน)
            [103.2542, 16.2448],
            [103.2568, 16.2432],   // จุดส่งที่ 1 (Order #103)
            [103.2589, 16.2415],
            [103.2612, 16.2395],   // จุดส่งที่ 2 (Order #104)
          ],
        } as unknown as RouteLine,
      },
    ];

    this.previewPlan.set(mockPlan);
    this.routeLines.set(mockRoutes);
  }
}
