import { Component, inject } from '@angular/core';
import { RouteService } from '../../../service/route.service';

@Component({
  imports: [],
  selector: 'app-route',
  styleUrl: './route.css',
  templateUrl: './route.html',
  host:{ class: 'block w-full' },
})
export class Route {
  RouteService = inject(RouteService);

  toggleConfirmRouteForTestOkDoYouUnderstand() {
    this.RouteService.toggleConfirmRoute();
  }

  selectedJobId = 4;

  jobs = [
    { id: 4, destination: 'สนามบิน', orders: 3, boxes: 3, distance: '5 km' },
    { id: 5, destination: 'บ้านแมน', orders: 1, boxes: 3, distance: '4.5 km' },
    { id: 6, destination: 'คอนโดไฮไรส์ ชั้น 12', orders: 3, boxes: 3, distance: '2.1 km' },
    { id: 7, destination: 'หมู่บ้านออคิด วิลล่า ซอย 5', orders: 2, boxes: 1, distance: '5.8 km' },
    { id: 8, destination: 'ร้านกาแฟคอฟฟี่คัพ ปากซอยสุขุมวิท 49', orders: 3, boxes: 2, distance: '1.5 km' },
  ];

  jobsReady = [
    {
      id: 1, title: 'งาน 1', orders: 'Order #1 , #7', stops: 2, status: 'delivering', bar: 'bg-red-400', progress: 58,
      from: 'จุด 1', to: 'จุด 2', rider: 'Hakurei Reimu', route: 'จุด 1 (Ilrumix) → จุด 2 (เซเลน่า)', info: 'ระยะทางรวม 10 กม. · ถึงใน 18 นาที'
    },
    {
      id: 2, title: 'งาน 2', orders: 'Order #3 , #4', stops: 2, status: 'waiting', bar: 'bg-purple-300', progress: 10,
      from: 'จุด 1', to: 'จุด 2', rider: 'Rider B', route: 'จุด 1 → จุด 2', info: 'ระยะทางรวม 6 กม. · ถึงใน 12 นาที'
    },
    {
      id: 3, title: 'งาน 3', orders: 'Order #5 , #6 , #8', stops: 3, status: 'delivering', bar: 'bg-sky-300', progress: 40,
      from: 'จุด 1', to: 'จุด 3', rider: 'Rider C', route: 'จุด 1 → จุด 2 → จุด 3', info: 'ระยะทางรวม 14 กม. · ถึงใน 25 นาที'
    },
    {
      id: 9, title: 'งาน 9', orders: 'Order #9 , #10', stops: 2, status: 'delivering', bar: 'bg-yellow-200', progress: 70,
      from: 'จุด 1', to: 'จุด 2', rider: 'Rider D', route: 'จุด 1 → จุด 2', info: 'ระยะทางรวม 8 กม. · ถึงใน 9 นาที'
    },
    {
      id: 10, title: 'งาน 10', orders: 'Order #11', stops: 1, status: 'done', bar: 'bg-amber-700', progress: 100,
      from: 'จุด 1', to: 'จุด 1', rider: 'Rider E', route: 'จุด 1', info: 'ส่งเสร็จแล้ว'
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
