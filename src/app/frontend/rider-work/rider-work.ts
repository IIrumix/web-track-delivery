import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
export interface WorkTask {
  id: string;
  label: string;
  completed: boolean;
}

export interface DeliveryStop {
  id: string;
  customer: string;
  orderNumber: number;
  address: string;
  tasks: WorkTask[];
}

export interface RiderJob {
  dateLabel: string;
  rider: string;
  pickupTasks: WorkTask[];
  stops: DeliveryStop[];
}

// Replace this factory with the API response mapping when the endpoint is ready.
// Each visit gets its own copy; checking a task never mutates the mock fixture.
export function createMockRiderJob(): RiderJob {
  return {
    dateLabel: 'อังคาร 23 ก.ย.',
    rider: 'Harukei Reimu',
    pickupTasks: [
      { id: 'pickup-boxes', label: 'รับอาหาร 3 กล่อง', completed: false },
      {
        id: 'pickup-buns',
        label: 'มันฝรั่งอบกรอบ หน้าแซลมอนรมควัน และคาเวียร์ x2',
        completed: false,
      },
      {
        id: 'pickup-steak',
        label: 'สเต๊กเกรดวากิวญี่ปุ่น A5 ส่วนริบอาย เสิร์ฟพร้อมเนยทรัฟเฟิลดำ x1',
        completed: false,
      },
    ],
    stops: [
      {
        id: 'stop-1',
        customer: 'Ilumix',
        orderNumber: 1,
        address: 'จุดส่ง 1 — ที่อยู่ลูกค้า Ilumix (ข้อมูลจำลอง)',
        tasks: [
          { id: 'deliver-ilumix', label: 'นำอาหารไปส่งลูกค้า นาย Ilumix', completed: false },
          {
            id: 'handoff-buns',
            label: 'มอบมันฝรั่งอบกรอบ หน้าแซลมอนรมควัน และคาเวียร์ x2 ให้ลูกค้า',
            completed: false,
          },
        ],
      },
      {
        id: 'stop-2',
        customer: 'เซนป่า',
        orderNumber: 7,
        address: 'จุดส่ง 2 — ที่อยู่ลูกค้า เซนป่า (ข้อมูลจำลอง)',
        tasks: [
          { id: 'deliver-senpa', label: 'นำอาหารไปส่งลูกค้า นาง เซนป่า', completed: false },
          {
            id: 'handoff-steak',
            label: 'มอบสเต๊กเกรดวากิวญี่ปุ่น A5 ส่วนริบอาย เสิร์ฟพร้อมเนยทรัฟเฟิลดำ x1 ให้ลูกค้า',
            completed: false,
          },
        ],
      },
    ],
  };
}

@Component({
  selector: 'app-rider-work',
  host: { class: 'block' },
  templateUrl: './rider-work.html',
  styleUrl: './rider-work.css',
})
export class RiderWork {
  readonly workNumber = inject(ActivatedRoute).snapshot.paramMap.get('workNumber') ?? '1';
  readonly job = signal(createMockRiderJob());
  readonly selectedStop = signal<DeliveryStop | null>(null);
  readonly pickupComplete = computed(() => this.allComplete(this.job().pickupTasks));
  readonly deliveryStarted = computed(() =>
    this.job().stops.some((stop) => stop.tasks.some((task) => task.completed)),
  );
  readonly completedOrders = computed(
    () => this.job().stops.filter((stop) => this.allComplete(stop.tasks)).length,
  );

  allComplete(tasks: WorkTask[]): boolean {
    return tasks.length > 0 && tasks.every((task) => task.completed);
  }

  togglePickup(taskId: string): void {
    // Once delivery has started, keep the pickup record completed.
    if (this.deliveryStarted()) return;
    this.job.update((job) => ({
      ...job,
      pickupTasks: job.pickupTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    }));
  }

  toggleDelivery(stopId: string, taskId: string): void {
    if (!this.pickupComplete()) return;
    this.job.update((job) => ({
      ...job,
      stops: job.stops.map((stop) =>
        stop.id === stopId
          ? {
              ...stop,
              tasks: stop.tasks.map((task) =>
                task.id === taskId ? { ...task, completed: !task.completed } : task,
              ),
            }
          : stop,
      ),
    }));
  }

  completePickup(): void {
    this.job.update((job) => ({
      ...job,
      pickupTasks: job.pickupTasks.map((task) => ({ ...task, completed: true })),
    }));
  }

  completeDelivery(stopId: string): void {
    if (!this.pickupComplete()) return;
    this.job.update((job) => ({
      ...job,
      stops: job.stops.map((stop) =>
        stop.id === stopId
          ? { ...stop, tasks: stop.tasks.map((task) => ({ ...task, completed: true })) }
          : stop,
      ),
    }));
  }
}
