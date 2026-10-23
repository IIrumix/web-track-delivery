import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Route } from './route';

describe('Simulated order planning', () => {
  it('limits a large simulation to 30 and displays backend validation details', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const component = TestBed.runInInjectionContext(() => new Route());
    const http = TestBed.inject(HttpTestingController);
    component.toggleCreateRoute();
    http.expectOne(`/api/job-sheets/eligible-orders?date=${component.date}`)
      .flush(Array.from({ length: 52 }, (_, i) => ({ order_id: i + 1 })));
    const request = http.expectOne('/api/job-sheets/preview');
    expect(request.request.body.order_ids).toHaveLength(30);
    request.flush({ error: 'Cannot plan', details: [{ order_id: 8, reason: 'Outside area' }] },
      { status: 422, statusText: 'Unprocessable Entity' });
    expect(component.RouteService.planMessage()).toContain('#8: Outside area');
    expect(component.RouteService.loadingPreview()).toBe(false);
    http.verify();
  });
});
