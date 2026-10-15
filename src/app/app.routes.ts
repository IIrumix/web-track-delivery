import { Routes } from '@angular/router';
import { WorkNumForm } from './frontend/work-num-form/work-num-form';
import { DriverGui } from './frontend/driver-gui/driver-gui';
import { Customer } from './frontend/owner-page/customer/customer';
import { Order } from './frontend/owner-page/order/order';
import { OwnerLayout } from './frontend/owner-layout/owner-layout';

export const routes: Routes = [
  { path: '', component: WorkNumForm },
  { path: 'owner',
    component: OwnerLayout,
    children: [
      { path: '', redirectTo: 'customer', pathMatch: 'full' },
      { path: 'customer', component: Customer },
      { path: 'order', component: Order },
      { path: 'driver-gui', component: DriverGui }
    ],
  },
];
