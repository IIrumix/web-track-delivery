import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RouteService {
  confirmRoute = signal(false);

  toggleConfirmRoute() {
    this.confirmRoute.update(current => !current);
  }
}