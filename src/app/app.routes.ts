import { Routes } from '@angular/router';
import { WorkNumForm } from './frontend/work-num-form/work-num-form';
import { DriverGui } from './frontend/driver-gui/driver-gui';
import { Customer } from './frontend/owner-page/customer/customer';
import { Order } from './frontend/owner-page/order/order';
import { OwenerLayout } from './frontend/owener-layout/owener-layout';

export const routes: Routes = [
  { path: '', component: WorkNumForm },
  { path: 'work-num-form', component: WorkNumForm },
  { path: 'owner-gui', redirectTo: 'owner/customer', pathMatch: 'full' },
  { path: 'driver-gui', component: DriverGui },
  {
    path: 'rider/:workNumber',
    loadComponent: () => import('./frontend/rider-work/rider-work').then((m) => m.RiderWork),
  },
  {
    path: 'owner',
    component: OwenerLayout,
    children: [
      { path: '', redirectTo: 'customer', pathMatch: 'full' },
      { path: 'customer', component: Customer },
      { path: 'order', component: Order },
      { path: 'driver-gui', component: DriverGui },
    ],
  },
];
