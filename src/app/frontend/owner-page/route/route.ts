import { Component, inject } from '@angular/core';
import { RouteService } from '../../../service/route.service';

@Component({
  imports: [],
  selector: 'app-route',
  styleUrl: './route.css',
  templateUrl: './route.html',
  host:{ class: 'block w-full z-1000' },
})
export class Route {
  RouteService = inject(RouteService);
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
        const orderIds = orders.map((order) => order.order_id);
        this.RouteService.getPreviewPlan(orderIds, this.date).subscribe({
          next: (preview) => {
            // เริ่มชุดแผนใหม่เมื่อคำนวณจากรายการออเดอร์ใหม่
            this.RouteService.seenPlanSignatures.set([preview.signature]);
            this.RouteService.selectedJobIndex.set(null);
            this.previewPlan.set(preview);
            this.RouteService.createRoute.set(true);
            // เตรียมเส้นทางทุกใบงานไว้ใน service ให้หน้าแผนที่นำไปวาดต่อ
            this.RouteService.loadRouteLines(preview);
            this.RouteService.loadingPreview.set(false);
          },
          error: (error) => {
            this.RouteService.loadingPreview.set(false);
            console.error('โหลดแผนการขนส่งไม่สำเร็จ', error);
          },
        });
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
        this.RouteService.selectedJobIndex.set(null);
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

  selectJob(index: number): void {
    this.RouteService.selectedJobIndex.update((selectedIndex) =>
      selectedIndex === index ? null : index,
    );
  }

  onJobCardKeydown(event: KeyboardEvent, index: number): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    this.selectJob(index);
  }

}
