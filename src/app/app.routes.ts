import { Routes } from '@angular/router';
import { WorkNumForm } from './frontend/work-num-form/work-num-form';
import { OwnerGui } from './frontend/owner-gui/owner-gui';
import { DriverGui } from './frontend/driver-gui/driver-gui';

export const routes: Routes = [
  { path: '', component: WorkNumForm },
  { path: 'work-num-form', component: WorkNumForm },
  { path: 'owner-gui', component: OwnerGui },
  { path: 'driver-gui', component: DriverGui },
  {
    path: 'rider/:workNumber',
    loadComponent: () => import('./frontend/rider-work/rider-work').then((m) => m.RiderWork),
  },
];
