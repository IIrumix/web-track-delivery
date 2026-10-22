import { Component, inject, signal } from '@angular/core';
import { RouteService } from '../../../service/route.service';
import { PlanningOrder } from '../../../model/delivery-response';

@Component({
  imports: [],
  selector: 'app-route',
  styleUrl: './route.css',
  templateUrl: './route.html',
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
    this.RouteService.getEligibleJobs(this.date).subscribe({
      next: (orders) => {
        this.eligibleOrders.set(orders);
        const orderIds = orders.map((order) => order.order_id);
        this.RouteService.getPreviewPlan(orderIds, this.date).subscribe({
          next: (preview) => {
            this.previewPlan.set(preview);
            this.RouteService.createRoute.set(true);
            // console.log(preview);
            console.log(preview.jobs);
          },
          error: (error) => {
            console.error('โหลดแผนการขนส่งไม่สำเร็จ', error);
          },
        });
        // console.log(this.eligibleOrders());
      },
      error: (error) => {
        console.error('โหลดออเดอร์ไม่สำเร็จ', error);
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
