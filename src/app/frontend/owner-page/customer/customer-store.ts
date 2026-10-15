import { HttpClient } from '@angular/common/http';
import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { Subscription, map, timeout } from 'rxjs';

export const CUSTOMERS_API_URL = '/api/customers';

interface ApiCustomer {
  customer_id: number | string;
  name: string;
  phone: string | null;
  address: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
}

export interface CustomerRecord {
  id: number | string;
  name: string;
  phone: string;
  address: string;
  coordinates: [number, number] | null;
}

function coordinate(value: unknown, limit: number): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && !value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && Math.abs(parsed) <= limit ? parsed : null;
}

function normalizeCustomers(response: ApiCustomer[]): CustomerRecord[] {
  if (!Array.isArray(response)) throw new Error('Expected a customer array.');
  return response.map((customer) => {
    const latitude = coordinate(customer.latitude, 90);
    const longitude = coordinate(customer.longitude, 180);
    return {
      id: customer.customer_id,
      name: customer.name?.trim() || 'ไม่ระบุชื่อ',
      phone: customer.phone ?? '',
      address: customer.address ?? '',
      coordinates: latitude !== null && longitude !== null ? [latitude, longitude] : null,
    };
  });
}

// Scoped to the owner layout so the customer list and map share one API request.
@Injectable()
export class CustomerStore {
  private readonly http = inject(HttpClient);
  private request?: Subscription;
  readonly customers = signal<CustomerRecord[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly search = signal('');
  readonly selectedCustomer = signal<CustomerRecord | null>(null);
  readonly locatedCustomers = computed(() =>
    this.customers().filter((customer) => customer.coordinates !== null),
  );
  readonly filteredCustomers = computed(() => {
    const query = this.search().trim().toLocaleLowerCase();
    return this.customers().filter((customer) =>
      `${customer.name} ${customer.phone} ${customer.address}`.toLocaleLowerCase().includes(query),
    );
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.request?.unsubscribe());
    this.load();
  }

  load(): void {
    this.request?.unsubscribe();
    this.loading.set(true);
    this.error.set(null);
    this.selectedCustomer.set(null);
    this.request = this.http
      .get<ApiCustomer[]>(CUSTOMERS_API_URL)
      .pipe(timeout(60_000), map(normalizeCustomers))
      .subscribe({
        next: (customers) => {
          this.customers.set(customers);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('โหลดข้อมูลลูกค้าไม่สำเร็จ กรุณาลองอีกครั้ง');
          this.loading.set(false);
        },
      });
  }

  selectCustomer(customer: CustomerRecord): void {
    if (customer.coordinates) this.selectedCustomer.set({ ...customer });
  }
}
