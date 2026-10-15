import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

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
    await router.navigateByUrl('/owner-gui');
    await fixture.whenStable();
    expect(compiled.querySelector('app-owner-gui')).toBeTruthy();
  });
});
