import { Component, inject, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RouteService } from '../../../service/route.service';
import { RiderJob } from '../../../model/saved-delivery';

@Component({
  selector: 'app-confirmed-jobs',
  imports: [RouterLink],
  templateUrl: './confirmed-jobs.html',
  host: { class: 'block w-full z-1000' },
})
export class ConfirmedJobs implements OnDestroy {
  readonly service = inject(RouteService);
  date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date());
  constructor() {
    this.service.viewingSaved.set(true);
    this.service.planMessage.set(null);
    void this.service.loadSavedJobs(this.date);
  }
  reload(date = this.date) {
    if (!date) return;
    this.date = date;
    this.service.planMessage.set(null);
    void this.service.loadSavedJobs(date);
  }
  select(index: number) {
    this.service.selectedJobIndex.update((value) => (value === index ? null : index));
  }
  status(job: RiderJob) {
    return job.completed_at
      ? 'ส่งครบแล้ว'
      : job.started_at
        ? 'กำลังส่ง'
        : job.status === 'ISSUED'
          ? 'รอเริ่มงาน'
          : job.status;
  }
  ngOnDestroy() {
    this.service.showCreationPage();
  }

   private getJobColor(index: number): string {
    const colors = ['#2563eb','#dc2626','#16a34a','#9333ea','#ea580c','#0891b2', '#db2777', '#ca8a04', '#475569','#65a30d',];
    return colors[index % colors.length];
  }
}
