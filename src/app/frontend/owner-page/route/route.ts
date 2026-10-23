import { Component, inject } from '@angular/core';
import { RouteService } from '../../../service/route.service';

@Component({
  imports: [],
  selector: 'app-route',
  styleUrl: './route.css',
  templateUrl: './route.html',
  host: { class: 'block w-full z-1000' },
})
export class Route {
  RouteService = inject(RouteService);
  // อ้าง signal ใน Service เดิม เมื่อ Component ถูกสร้างใหม่จึงยังอ่านแผนที่เก็บไว้ได้
  readonly previewPlan = this.RouteService.previewPlan;
  readonly jobs = this.RouteService.jobs;
  today = new Date();
  date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(this.today);

  constructor() {
    this.RouteService.showCreationPage();
  }

  async confirmPlan() {
    if (await this.RouteService.confirmPreview()) {
      this.RouteService.getEligibleJobs(this.date).subscribe({
        error: () =>
          this.RouteService.planMessage.set('บันทึกสำเร็จ แต่โหลดออเดอร์คงเหลือไม่สำเร็จ'),
      });
    }
  }

  jobLabel(index: number) {
    return this.previewPlan()
      ? index + 1
      : (this.RouteService.savedJobs()[index]?.job_code ?? index + 1);
  }

  jobStatus(index: number) {
    if (this.previewPlan()) return 'แผนตัวอย่าง';
    const job = this.RouteService.savedJobs()[index];
    return job?.completed_at ? 'ส่งครบแล้ว' : job?.started_at ? 'กำลังส่ง' : 'รอเริ่มงาน';
  }

  toggleCreateRoute() {
    // กันส่งคำขอซ้ำ แม้เรียกเมธอดโดยตรงระหว่างที่ API ยังทำงาน
    if (this.RouteService.isCreatingRoute()) return;
    this.RouteService.loadingPreview.set(true);
    this.RouteService.planMessage.set(null);
    this.RouteService.getEligibleJobs(this.date).subscribe({
      next: (orders) => {
        if (!orders.length) {
          this.RouteService.previewPlan.set(null);
          this.RouteService.createRoute.set(false);
          this.RouteService.loadingPreview.set(false);
          this.RouteService.planMessage.set('ไม่มีออเดอร์ที่พร้อมจัดงาน');
          this.RouteService.showCreationPage();
          return;
        }
        // Backend รับ 1–30 ออเดอร์ต่อแผน จัดชุดแรกก่อน ที่เหลือจัดหลังยืนยันรอบนี้
        const eligibleIds = [...new Set(orders.map((order) => order.order_id))];
        const orderIds = eligibleIds.slice(0, 30);
        const batchMessage = eligibleIds.length > 30
          ? `คำนวณ 30 จาก ${eligibleIds.length} ออเดอร์ อีก ${eligibleIds.length - 30} รายการให้สร้างใบงานรอบถัดไปหลังยืนยัน`
          : null;
        this.RouteService.getPreviewPlan(orderIds, this.date).subscribe({
          next: (preview) => {
            // เริ่มชุดแผนใหม่เมื่อคำนวณจากรายการออเดอร์ใหม่
            this.RouteService.seenPlanSignatures.set([preview.signature]);
            this.RouteService.selectedJobIndex.set(null);
            this.previewPlan.set(preview);
            this.RouteService.createRoute.set(true);
            this.RouteService.planMessage.set(batchMessage);
            this.RouteService.confirmRoute.set(false);
            this.RouteService.confirmationUncertain.set(false);
            // เตรียมเส้นทางทุกใบงานไว้ใน service ให้หน้าแผนที่นำไปวาดต่อ
            this.RouteService.loadRouteLines(preview);
            this.RouteService.loadingPreview.set(false);
          },
          error: (error) => {
            this.RouteService.loadingPreview.set(false);
            this.RouteService.planMessage.set(this.previewError(error, 'โหลดแผนการขนส่งไม่สำเร็จ'));
          },
        });
      },
      error: (error) => {
        this.RouteService.loadingPreview.set(false);
        this.RouteService.planMessage.set(this.previewError(error, 'โหลดออเดอร์ไม่สำเร็จ'));
      },
    });
  }

  // แสดงเหตุผลรายออเดอร์จาก Backend แทนการซ่อนรายละเอียดไว้ใน console
  private previewError(error: unknown, fallback: string): string {
    const body = (error as { error?: { error?: unknown; details?: unknown } } | null)?.error;
    const message = typeof body?.error === 'string' ? body.error : fallback;
    const details = Array.isArray(body?.details) ? body.details : [];
    return [message, ...details.flatMap(item => item && typeof item.reason === 'string'
      ? [`ออเดอร์ #${item.order_id ?? '-'}: ${item.reason}`] : [])].join(' — ');
  }

  requestAlternativePlan() {
    const currentPlan = this.previewPlan();
    if (!currentPlan || this.RouteService.isCreatingRoute()) return;

    const excluded = [
      ...new Set([...this.RouteService.seenPlanSignatures(), currentPlan.signature]),
    ];
    // Backend รับรายการแผนที่ขอข้ามได้สูงสุด 20 แผน
    if (excluded.length > 20) {
      this.RouteService.planMessage.set(
        'ขอแผนอื่นครบ 20 ครั้งแล้ว กรุณาใช้แผนปัจจุบันหรือเริ่มคำนวณใหม่',
      );
      return;
    }

    // อ่านออเดอร์จาก preview เดิม จึงยังใช้ได้แม้เปลี่ยนหน้าแล้วกลับมา
    const orderIds = currentPlan.jobs.flatMap((job) =>
      job.stops.map((stop) => stop.order.order_id),
    );
    this.RouteService.loadingPreview.set(true);
    this.RouteService.planMessage.set(null);
    this.RouteService.getPreviewPlan(
      orderIds,
      currentPlan.settings.delivery_date,
      excluded,
      currentPlan.settings,
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
