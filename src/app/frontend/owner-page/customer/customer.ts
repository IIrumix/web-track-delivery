import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CustomerRecord } from '../../../model/customer-response';
import { CustomerService, CustomerUpdate } from '../../../service/customer.service';

@Component({
  imports: [FormsModule],
  selector: 'app-customer',
  styleUrl: './customer.css',
  templateUrl: './customer.html',
  host: { class: 'z-10 block w-full h-full' },
})
export class Customer implements OnDestroy {
  private dataSubscription: Subscription;
  editingCustomer: CustomerRecord | null = null;
  editForm: CustomerUpdate = this.emptyForm();
  saving = false;
  editError = '';

  constructor(
    public store: CustomerService,
    private changeDetector: ChangeDetectorRef,
  ) {

    this.dataSubscription = this.store.changes.subscribe(() => {
      this.changeDetector.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.dataSubscription.unsubscribe();
  }

  openEdit(customer: CustomerRecord, event: Event): void {
    event.stopPropagation();
    this.editingCustomer = customer;
    this.editError = '';
    this.editForm = {
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      latitude: customer.coordinates?.[0] ?? 0,
      longitude: customer.coordinates?.[1] ?? 0,
    };
  }

  closeEdit(): void {
    this.editingCustomer = null;
  }

  saveEdit(): void {
    if (!this.editingCustomer || this.saving || !this.editForm.name.trim() || !this.editForm.phone.trim() || !this.editForm.address.trim()) return;
    this.saving = true;
    this.editError = '';
    this.store.updateCustomer(this.editingCustomer, { ...this.editForm }).subscribe({
      next: () => {
        this.saving = false;
        this.editingCustomer = null;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.saving = false;
        this.editError = 'บันทึกข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง';
        this.changeDetector.markForCheck();
      },
    });
  }

  private emptyForm(): CustomerUpdate {
    return { name: '', phone: '', address: '', latitude: 0, longitude: 0 };
  }
}
