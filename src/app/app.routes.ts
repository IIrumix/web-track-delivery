import { Routes } from '@angular/router';
import { WorkNumForm } from './frontend/work-num-form/work-num-form';

export const routes: Routes = [
  { path: '', component: WorkNumForm },
  {
    path: 'rider/:workNumber',
    loadComponent: () => import('./frontend/rider-work/rider-work').then((m) => m.RiderWork),
  },
];
