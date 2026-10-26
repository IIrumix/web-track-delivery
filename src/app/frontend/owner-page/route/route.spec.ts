import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Route } from './route';
import { DeliveryPlan } from '../../../model/delivery-response';

describe('Order selection form', () => {
  let component: Route;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    component = TestBed.runInInjectionContext(() => new Route());
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  function open() {
    component.toggleCreateRoute();
    http
      .expectOne(`/api/job-sheets/eligible-orders?date=${component.date}`)
      .flush(Array.from({ length: 52 }, (_, i) => ({ order_id: i + 1 })));
  }
  it('waits for selection and sends only selected IDs, retaining selection on validation error', () => {
    open();
    expect(component.choosingOrders()).toBe(true);
    expect(component.selectedOrderIds().size).toBe(30);
    component.clearOrderSelection();
    component.calculateSelectedOrders();
    http.expectNone('/api/job-sheets/preview');
    component.toggleOrder(8, true);
    component.toggleOrder(40, true);
    component.calculateSelectedOrders();
    const request = http.expectOne('/api/job-sheets/preview');
    expect(request.request.body.order_ids).toEqual([8, 40]);
    request.flush(
      { error: 'Cannot plan', details: [{ order_id: 8, reason: 'Outside area' }] },
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    expect(component.RouteService.planMessage()).toContain('#8: Outside area');
    expect(component.selectedOrderIds().size).toBe(2);
    expect(component.choosingOrders()).toBe(true);
  });
  it('enforces 30 selections but permits replacing an order', () => {
    open();
    for (let id = 1; id <= 31; id++) component.toggleOrder(id, true);
    expect(component.selectedOrderIds().size).toBe(30);
    expect(component.selectedOrderIds().has(31)).toBe(false);
    component.toggleOrder(1, false);
    component.toggleOrder(31, true);
    expect(component.selectedOrderIds().size).toBe(30);
    expect(component.selectedOrderIds().has(31)).toBe(true);
    component.toggleOrder(99, true);
    expect(component.selectedOrderIds().has(99)).toBe(false);
  });
  it('preselects current orders and lets removed orders be selected again', () => {
    const original = {
      jobs: [{ stops: [{ order: { order_id: 1 } }, { order: { order_id: 2 } }] }],
    } as DeliveryPlan;
    component.previewPlan.set(original);
    open();
    expect([...component.selectedOrderIds()]).toEqual([1, 2]);
    component.toggleOrder(1, false);
    component.toggleOrder(3, true);
    component.calculateSelectedOrders();
    const request = http.expectOne('/api/job-sheets/preview');
    expect(request.request.body.order_ids).toEqual([2, 3]);
    request.flush({ preview_id: 'edited', signature: 's', jobs: [], settings: {}, summary: {} });
    // Opening again fetches eligible orders, including the one removed from the draft.
    open();
    component.clearOrderSelection();
    expect(component.availableOrders().some((order) => order.order_id === 1)).toBe(true);
    component.toggleOrder(1, true);
    expect(component.selectedOrderIds().has(1)).toBe(true);
    http.expectNone('/api/job-sheets/confirm');
  });
  it('allows removing all draft orders without deleting database orders', () => {
    component.previewPlan.set({ jobs: [{ stops: [{ order: { order_id: 1 } }] }] } as DeliveryPlan);
    open();
    component.clearOrderSelection();
    component.calculateSelectedOrders();
    expect(component.previewPlan()).toBeNull();
    expect(component.RouteService.createRoute()).toBe(false);
    http.expectNone('/api/job-sheets/preview');
    http.expectNone('/api/job-sheets/confirm');
  });
  it('cancels without calculating and closes after a successful preview', () => {
    open();
    component.toggleOrder(1, true);
    component.cancelOrderForm();
    component.calculateSelectedOrders();
    http.expectNone('/api/job-sheets/preview');
    open();
    component.clearOrderSelection();
    component.toggleOrder(2, true);
    component.calculateSelectedOrders();
    http
      .expectOne('/api/job-sheets/preview')
      .flush({ preview_id: 'new', signature: 'sig', jobs: [], summary: {}, settings: {} });
    expect(component.choosingOrders()).toBe(false);
    expect(component.previewPlan()?.preview_id).toBe('new');
  });
});
