import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CustomerService } from '../../../service/customer.service';

@Component({
  imports: [],
  selector: 'app-customer',
  styleUrl: './customer.css',
  templateUrl: './customer.html',
  host: { class: 'block w-3/4 h-full' },
})
export class Customer implements OnDestroy {
  private dataSubscription: Subscription;

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
}
