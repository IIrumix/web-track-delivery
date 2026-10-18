import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';
import { CustomerRecord } from '../../../../model/customer-response';
import { CustomerService } from '../../../../service/customer.service';

@Component({
  selector: 'app-customer-detail-panel',
  templateUrl: './customer-detail-panel.html',
  styleUrl: './customer-detail-panel.css',
  host: { class: 'flex min-h-0 min-w-0 flex-1 pl-4' },
})
export class CustomerDetailPanel implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) private mapContainer!: ElementRef<HTMLDivElement>;
  private map: L.Map | null = null;
  private markerGroup: L.FeatureGroup | null = null;
  private dataSubscription: Subscription;
  private customerMarkers: { customerId: number | string; marker: L.Marker }[] = [];
  private pinIcon = L.icon({
    iconUrl: 'customer-pin.svg',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -35],
  });

  constructor(
    public store: CustomerService,
    private changeDetector: ChangeDetectorRef,
  ) {
    this.dataSubscription = this.store.changes.subscribe((action) => {
      if (action === 'loaded') this.drawCustomerPins();
      if (action === 'selected') this.goToCustomer(this.store.selectedCustomer);
      if (action === 'show-all') this.showAll();
      this.changeDetector.markForCheck();
    });
  }

  ngAfterViewInit(): void {
    this.map = L.map(this.mapContainer.nativeElement).setView([16.25, 103.25], 12);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
    this.markerGroup = L.featureGroup().addTo(this.map);
    this.drawCustomerPins();
    this.goToCustomer(this.store.selectedCustomer);
  }

  // ล้างหมุดเดิมแล้วสร้างจากลูกค้าที่มีพิกัด
  private drawCustomerPins(): void {
    if (this.markerGroup === null) return;
    this.markerGroup.clearLayers();
    this.customerMarkers = [];

    for (const customer of this.store.locatedCustomers) {
      if (customer.coordinates === null) continue;
      const marker = L.marker(customer.coordinates, {
        icon: this.pinIcon,
        title: customer.name,
        alt: 'ตำแหน่งลูกค้า ' + customer.name,
      });
      marker.bindPopup(this.createPopup(customer));
      marker.on('click', () => this.store.selectCustomer(customer));
      this.markerGroup.addLayer(marker);
      this.customerMarkers.push({ customerId: customer.id, marker: marker });
    }
    this.showAll();
  }

  private goToCustomer(customer: CustomerRecord | null): void {
    if (customer === null || customer.coordinates === null || this.map === null) return;
    let zoom = 16;
    if (this.map.getZoom() > zoom) zoom = this.map.getZoom();
    this.map.setView(customer.coordinates, zoom);
    for (const item of this.customerMarkers) {
      if (item.customerId === customer.id) {
        item.marker.openPopup();
        break;
      }
    }
  }

  showAll(): void {
    if (this.map === null || this.markerGroup === null) return;
    const bounds = this.markerGroup.getBounds();
    if (bounds.isValid()) {
      this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }

  private createPopup(customer: CustomerRecord): HTMLElement {
    const popup = document.createElement('div');
    const name = document.createElement('strong');
    name.textContent = customer.name;
    popup.appendChild(name);

    // แสดงข้อมูล API เป็นข้อความ เพื่อไม่ให้ถูกตีความเป็น HTML
    for (const value of [customer.address, customer.phone]) {
      if (!value) continue;
      const line = document.createElement('p');
      line.textContent = value;
      popup.appendChild(line);
    }
    return popup;
  }

  ngOnDestroy(): void {
    this.dataSubscription.unsubscribe();
    if (this.map) this.map.remove();
  }
}
