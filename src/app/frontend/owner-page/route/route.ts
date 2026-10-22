import { Component, inject, signal } from '@angular/core';
import { RouteService } from '../../../service/route.service';
import { PlanningOrder } from '../../../model/delivery-response';

@Component({
  imports: [],
  selector: 'app-route',
  styleUrl: './route.css',
  templateUrl: './route.html',
  host:{ class: 'block w-full' },
})
export class Route {
  RouteService = inject(RouteService);
  eligibleOrders = signal<PlanningOrder[]>([]);
  // อ้าง signal ใน Service เดิม เมื่อ Component ถูกสร้างใหม่จึงยังอ่านแผนที่เก็บไว้ได้
  readonly previewPlan = this.RouteService.previewPlan;
  readonly jobs = this.RouteService.jobs;
  today = new Date();
  date = this.today.toISOString().split('T')[0];

  toggleCreateRoute() {
    // กันส่งคำขอซ้ำ แม้เรียกเมธอดโดยตรงระหว่างที่ API ยังทำงาน
    if (this.RouteService.isCreatingRoute()) return;
    this.RouteService.loadingPreview.set(true);
    this.RouteService.planMessage.set(null);

    this.RouteService.getEligibleJobs(this.date).subscribe({
      next: (orders) => {
        this.eligibleOrders.set(orders);
        const orderIds = orders.map((order) => order.order_id);
        this.RouteService.getPreviewPlan(orderIds, this.date).subscribe({
          next: (preview) => {
            // เริ่มชุดแผนใหม่เมื่อคำนวณจากรายการออเดอร์ใหม่
            this.RouteService.seenPlanSignatures.set([preview.signature]);
            this.previewPlan.set(preview);
            this.RouteService.createRoute.set(true);
            // เตรียมเส้นทางทุกใบงานไว้ใน service ให้หน้าแผนที่นำไปวาดต่อ
            this.RouteService.loadRouteLines(preview);
            this.RouteService.loadingPreview.set(false);
            // console.log(preview);
            console.log(preview);
          },
          error: (error) => {
            this.RouteService.loadingPreview.set(false);
            console.error('โหลดแผนการขนส่งไม่สำเร็จ', error);
          },
        });
        // console.log(this.eligibleOrders());
      },
      error: (error) => {
        this.RouteService.loadingPreview.set(false);
        console.error('โหลดออเดอร์ไม่สำเร็จ', error);
      },
    });
  }

  requestAlternativePlan() {
    const currentPlan = this.previewPlan();
    if (!currentPlan || this.RouteService.isCreatingRoute()) return;

    const excluded = [...new Set([
      ...this.RouteService.seenPlanSignatures(), currentPlan.signature,
    ])];
    // Backend รับรายการแผนที่ขอข้ามได้สูงสุด 20 แผน
    if (excluded.length > 20) {
      this.RouteService.planMessage.set('ขอแผนอื่นครบ 20 ครั้งแล้ว กรุณาใช้แผนปัจจุบันหรือเริ่มคำนวณใหม่');
      return;
    }

    // อ่านออเดอร์จาก preview เดิม จึงยังใช้ได้แม้เปลี่ยนหน้าแล้วกลับมา
    const orderIds = currentPlan.jobs.flatMap((job) =>
      job.stops.map((stop) => stop.order.order_id),
    );
    this.RouteService.loadingPreview.set(true);
    this.RouteService.planMessage.set(null);
    this.RouteService.getPreviewPlan(
      orderIds, currentPlan.settings.delivery_date, excluded, currentPlan.settings,
    ).subscribe({
      next: (preview) => {
        this.RouteService.seenPlanSignatures.set([...excluded, preview.signature]);
        this.previewPlan.set(preview);
        this.RouteService.loadRouteLines(preview);
        this.RouteService.loadingPreview.set(false);
      },
      error: (error) => {
        // ไม่เปลี่ยน preview/เส้นทางเดิม เมื่อหาแผนอื่นไม่ได้หรือ API ล้มเหลว
        this.RouteService.planMessage.set(
          typeof error.error?.error === 'string'
            ? error.error.error
            : 'ขอแผนอื่นไม่สำเร็จ กรุณาลองอีกครั้ง',
        );
        this.RouteService.loadingPreview.set(false);
      },
    });
  }

  toggleConfirmRouteForTestOkDoYouUnderstand() {}

  selectedJobId = 4;


  jobsReady = [
    {
      id: 1,
      title: 'งาน 1',
      orders: 'Order #1 , #7',
      stops: 2,
      status: 'delivering',
      bar: 'bg-red-400',
      progress: 58,
      from: 'จุด 1',
      to: 'จุด 2',
      rider: 'Hakurei Reimu',
      route: 'จุด 1 (Ilrumix) → จุด 2 (เซเลน่า)',
      info: 'ระยะทางรวม 10 กม. · ถึงใน 18 นาที',
    },
    {
      id: 2,
      title: 'งาน 2',
      orders: 'Order #3 , #4',
      stops: 2,
      status: 'waiting',
      bar: 'bg-purple-300',
      progress: 10,
      from: 'จุด 1',
      to: 'จุด 2',
      rider: 'Rider B',
      route: 'จุด 1 → จุด 2',
      info: 'ระยะทางรวม 6 กม. · ถึงใน 12 นาที',
    },
    {
      id: 3,
      title: 'งาน 3',
      orders: 'Order #5 , #6 , #8',
      stops: 3,
      status: 'delivering',
      bar: 'bg-sky-300',
      progress: 40,
      from: 'จุด 1',
      to: 'จุด 3',
      rider: 'Rider C',
      route: 'จุด 1 → จุด 2 → จุด 3',
      info: 'ระยะทางรวม 14 กม. · ถึงใน 25 นาที',
    },
    {
      id: 9,
      title: 'งาน 9',
      orders: 'Order #9 , #10',
      stops: 2,
      status: 'delivering',
      bar: 'bg-yellow-200',
      progress: 70,
      from: 'จุด 1',
      to: 'จุด 2',
      rider: 'Rider D',
      route: 'จุด 1 → จุด 2',
      info: 'ระยะทางรวม 8 กม. · ถึงใน 9 นาที',
    },
    {
      id: 10,
      title: 'งาน 10',
      orders: 'Order #11',
      stops: 1,
      status: 'done',
      bar: 'bg-amber-700',
      progress: 100,
      from: 'จุด 1',
      to: 'จุด 1',
      rider: 'Rider E',
      route: 'จุด 1',
      info: 'ส่งเสร็จแล้ว',
    },
  ];

  badges = {
    delivering: { label: 'กำลังออกส่ง', cls: 'bg-green-300 text-slate-900' },
    waiting: { label: 'รอรับอาหาร', cls: 'bg-orange-200 text-slate-900' },
    done: { label: 'จัดส่งแล้ว', cls: 'bg-green-50 text-slate-700' },
  };

  openId = 1; // which card is expanded
  list = document.getElementById('list');
  b = this.badges.delivering;

  changeOpenId(id: number) {
    this.openId = id;
  }
}
