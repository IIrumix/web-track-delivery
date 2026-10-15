import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';

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

@Injectable()
export class CustomerStore implements OnDestroy {
  customers: CustomerRecord[] = [];
  locatedCustomers: CustomerRecord[] = [];
  filteredCustomers: CustomerRecord[] = [];
  selectedCustomer: CustomerRecord | null = null;
  loading = false;
  error = '';
  search = '';

  // แจ้งว่าโหลดลูกค้าเสร็จ (loaded), เลือกลูกค้า (selected) หรือเปลี่ยนสถานะ (updated)
  changes = new Subject<string>();
  private request?: Subscription;

  constructor(private http: HttpClient) {
    this.load();
  }

  load(): void {
    if (this.request) this.request.unsubscribe();
    this.loading = true;
    this.error = '';
    this.selectedCustomer = null;
    this.changes.next('updated');

    this.request = this.http.get<ApiCustomer[]>(CUSTOMERS_API_URL, { timeout: 60000 }).subscribe({
      next: (data) => {
        if (!Array.isArray(data)) {
          this.showLoadError();
          return;
        }

        const customers: CustomerRecord[] = [];
        const locatedCustomers: CustomerRecord[] = [];
        for (const item of data) {
          if (!item || typeof item !== 'object') {
            this.showLoadError();
            return;
          }

          const latitude = this.convertCoordinate(item.latitude, 90);
          const longitude = this.convertCoordinate(item.longitude, 180);
          const customer: CustomerRecord = {
            id: item.customer_id,
            name:
              typeof item.name === 'string' && item.name.trim() ? item.name.trim() : 'ไม่ระบุชื่อ',
            phone: item.phone ?? '',
            address: item.address ?? '',
            coordinates: null,
          };

          if (latitude !== null && longitude !== null) {
            customer.coordinates = [latitude, longitude];
            locatedCustomers.push(customer);
          }
          customers.push(customer);
        }

        this.customers = customers;
        this.locatedCustomers = locatedCustomers;
        this.loading = false;
        this.searchCustomers(this.search, 'loaded');
      },
      error: () => this.showLoadError(),
    });
  }

  // ค้นหาเฉพาะรายชื่อ หมุดบนแผนที่ยังแสดงครบทุกคน
  searchCustomers(text: string, action = 'updated'): void {
    this.search = text;
    this.filteredCustomers = [];
    const keyword = text.trim().toLowerCase();
    for (const customer of this.customers) {
      const details = customer.name + ' ' + customer.phone + ' ' + customer.address;
      if (details.toLowerCase().includes(keyword)) {
        this.filteredCustomers.push(customer);
      }
    }
    this.changes.next(action);
  }

  selectCustomer(customer: CustomerRecord): void {
    if (customer.coordinates === null) return;
    this.selectedCustomer = customer;
    this.changes.next('selected');
  }

  // ป้องกันค่าว่างถูกแปลงเป็นพิกัด 0 และป้องกันพิกัดเกินช่วง
  private convertCoordinate(value: unknown, limit: number): number | null {
    if (typeof value !== 'number' && typeof value !== 'string') return null;
    if (typeof value === 'string' && value.trim() === '') return null;
    const number = Number(value);
    if (!Number.isFinite(number) || Math.abs(number) > limit) return null;
    return number;
  }

  private showLoadError(): void {
    this.error = 'โหลดข้อมูลลูกค้าไม่สำเร็จ กรุณาลองอีกครั้ง';
    this.loading = false;
    this.changes.next('updated');
  }

  ngOnDestroy(): void {
    if (this.request) this.request.unsubscribe();
    this.changes.complete();
  }
}
