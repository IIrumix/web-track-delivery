import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOMERS_API_URL } from './frontend/owner-page/customer/customer-store';

function customerFixture() {
  return [
    {
      customer_id: 1,
      name: 'ทดสอบ A',
      phone: '0000000001',
      address: 'จุดส่ง A',
      latitude: '16.2461000',
      longitude: '103.2501000',
    },
    {
      customer_id: 2,
      name: 'ทดสอบ B',
      phone: '0000000002',
      address: 'จุดส่ง B',
      latitude: 16.247,
      longitude: 103.251,
    },
  ];
}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('keeps the work number form at the home route', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/');
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('input')?.getAttribute('placeholder')).toBe('กรอกเลขใบงาน');
    expect(compiled.querySelector('button')?.textContent).toContain('ยืนยัน');
  });

  it('keeps the rider work route available alongside the incoming routes', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/rider/67');
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(TestBed.inject(Router).url).toBe('/rider/67');
    expect(compiled.querySelector('h1')?.textContent).toContain('งานส่งของวันนี้');
  });

  it('renders the incoming driver and owner pages at their routes', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    const compiled = fixture.nativeElement as HTMLElement;
    await router.navigateByUrl('/driver-gui');
    await fixture.whenStable();
    expect(compiled.querySelector('app-driver-gui')).toBeTruthy();
    expect(compiled.querySelector('h1')?.textContent).toContain('งานส่งของวันนี้');
    await router.navigateByUrl('/owner-gui');
    fixture.detectChanges();
    TestBed.inject(HttpTestingController).expectOne(CUSTOMERS_API_URL).flush(customerFixture());
    await fixture.whenStable();
    expect(router.url).toBe('/owner/customer');
    expect(compiled.querySelector('app-owener-layout')).toBeTruthy();
    expect(compiled.querySelector('app-customer')).toBeTruthy();
    await router.navigateByUrl('/owner/order');
    await fixture.whenStable();
    expect(compiled.querySelector('app-order')).toBeTruthy();
  });

  it('loads one customer request for the list and all map pins, and keeps pins when searching', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/owner/customer');
    fixture.detectChanges();
    TestBed.inject(HttpTestingController).expectOne(CUSTOMERS_API_URL).flush(customerFixture());
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.leaflet-marker-icon')).toHaveLength(2);
    expect(compiled.querySelector('app-customer-map')?.textContent).toContain('2 หมุด');
    compiled.querySelector<HTMLButtonElement>('button[aria-label="ดูตำแหน่ง ทดสอบ A"]')!.click();
    await fixture.whenStable();
    expect(compiled.querySelector('.leaflet-popup-content')?.textContent).toContain('จุดส่ง A');

    const search = compiled.querySelector<HTMLInputElement>('input[type=search]')!;
    search.value = 'ทดสอบ B';
    search.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(compiled.querySelectorAll('app-customer button[aria-pressed]')).toHaveLength(1);
    expect(compiled.querySelectorAll('.leaflet-marker-icon')).toHaveLength(2);
    await TestBed.inject(Router).navigateByUrl('/owner/order');
    await fixture.whenStable();
    await TestBed.inject(Router).navigateByUrl('/owner/customer');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(compiled.querySelectorAll('.leaflet-marker-icon')).toHaveLength(2);
  });

  it('keeps customers with missing or invalid coordinates in the list without creating false pins', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/owner/customer');
    fixture.detectChanges();
    const base = customerFixture()[0];
    TestBed.inject(HttpTestingController)
      .expectOne(CUSTOMERS_API_URL)
      .flush([
        { ...base, customer_id: 1, latitude: '0', longitude: '0' },
        { ...base, customer_id: 2, latitude: null },
        { ...base, customer_id: 3, latitude: '' },
        { ...base, customer_id: 4, longitude: '181' },
      ]);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('app-customer button[aria-pressed]')).toHaveLength(4);
    expect(compiled.querySelectorAll('app-customer button:disabled')).toHaveLength(3);
    expect(compiled.querySelectorAll('.leaflet-marker-icon')).toHaveLength(1);
  });

  it('shows API errors, retries, and displays API text without interpreting HTML', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/owner/customer');
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne(CUSTOMERS_API_URL)
      .flush('Unavailable', { status: 503, statusText: 'Unavailable' });
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[role=alert]')?.textContent).toContain(
      'โหลดข้อมูลลูกค้าไม่สำเร็จ',
    );
    compiled.querySelector<HTMLButtonElement>('app-customer-map [role=alert] button')!.click();
    http
      .expectOne(CUSTOMERS_API_URL)
      .flush([{ ...customerFixture()[0], name: '<img src=x onerror=alert(1)>' }]);
    await fixture.whenStable();
    compiled.querySelector<HTMLButtonElement>('app-customer button[aria-pressed]')!.click();
    await fixture.whenStable();
    expect(compiled.querySelector('.leaflet-popup-content')?.textContent).toContain(
      '<img src=x onerror=alert(1)>',
    );
    expect(compiled.querySelector('.leaflet-popup-content img')).toBeNull();
  });

  it('opens the rider UI in driver-gui with the submitted work number', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector('input')!.value = '67';
    compiled.querySelector('button')!.click();
    await fixture.whenStable();
    expect(router.url).toBe('/driver-gui?workNumber=67');
    expect(compiled.querySelector('[data-testid=work-meta]')?.textContent).toContain('งาน 67');
    expect(compiled.querySelectorAll('input:disabled')).toHaveLength(4);

    compiled.querySelectorAll<HTMLInputElement>('input[type=checkbox]').forEach((input, index) => {
      if (index < 3) input.click();
    });
    await fixture.whenStable();
    expect(compiled.querySelectorAll('[data-testid=complete]')).toHaveLength(1);
    expect(compiled.querySelectorAll('input:disabled')).toHaveLength(0);
    compiled.querySelectorAll<HTMLInputElement>('input[type=checkbox]').forEach((input, index) => {
      if (index >= 3) input.click();
    });
    await fixture.whenStable();
    expect(compiled.querySelector('[role=status]')?.textContent).toContain('2 ออเดอร์ · 2 เสร็จ');
    expect(compiled.querySelectorAll('[data-testid=complete]')).toHaveLength(3);
  });
});
