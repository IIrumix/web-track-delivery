import { Routes } from '@angular/router';
import { WorkNumForm } from './frontend/work-num-form/work-num-form';
import { OwnerGui } from './frontend/owner-gui/owner-gui';
import { DriverGui } from './frontend/driver-gui/driver-gui';

export const routes: Routes = [
  { path: '', redirectTo: '/work-num-form', pathMatch: 'full' },
  { path: 'work-num-form', component: WorkNumForm },
  { path: 'owner-gui', component: OwnerGui },
  { path: 'driver-gui', component: DriverGui }
];
