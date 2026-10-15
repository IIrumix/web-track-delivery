import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  inject,
} from '@angular/core';
import * as L from 'leaflet';
import { CustomerRecord, CustomerStore } from './customer-store';

@Component({
  selector: 'app-customer-map',
  templateUrl: './customer-map.html',
  host: { class: 'flex min-h-0 min-w-0 flex-1' },
})
export class CustomerMap implements AfterViewInit, OnDestroy {
  readonly store = inject(CustomerStore);
  @ViewChild('mapContainer', { static: true }) private container!: ElementRef<HTMLDivElement>;
  private map?: L.Map;
  private group?: L.FeatureGroup;
  private resizeObserver?: ResizeObserver;
  private readonly markers = new Map<CustomerRecord['id'], L.Marker>();
  private readonly pinIcon = L.divIcon({
    className: '',
    html: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40" aria-hidden="true"><path d="M16 39S2 24 2 16a14 14 0 1 1 28 0c0 8-14 23-14 23Z" fill="#22c55e" stroke="#fff" stroke-width="2"/><circle cx="16" cy="16" r="5" fill="#fff"/></svg>',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -35],
  });

  constructor() {
    effect(() => this.renderCustomers(this.store.locatedCustomers()));
    effect(() => {
      const selected = this.store.selectedCustomer();
      if (selected?.coordinates && this.map) {
        this.map.setView(selected.coordinates, Math.max(this.map.getZoom(), 16));
        this.markers.get(selected.id)?.openPopup();
      }
    });
  }

  ngAfterViewInit(): void {
    this.map = L.map(this.container.nativeElement).setView([16.25, 103.25], 12);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
    this.group = L.featureGroup().addTo(this.map);
    this.renderCustomers(this.store.locatedCustomers());
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.map?.invalidateSize());
      this.resizeObserver.observe(this.container.nativeElement);
    }
  }

  showAll(): void {
    const bounds = this.group?.getBounds();
    if (bounds?.isValid()) this.map?.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
  }

  private renderCustomers(customers: CustomerRecord[]): void {
    if (!this.group) return;
    this.group.clearLayers();
    this.markers.clear();
    for (const customer of customers) {
      if (!customer.coordinates) continue;
      const marker = L.marker(customer.coordinates, {
        icon: this.pinIcon,
        title: customer.name,
        alt: `ตำแหน่งลูกค้า ${customer.name}`,
      }).bindPopup(this.popupContent(customer));
      marker.on('click', () => this.store.selectCustomer(customer));
      this.group.addLayer(marker);
      this.markers.set(customer.id, marker);
    }
    this.showAll();
  }

  private popupContent(customer: CustomerRecord): HTMLElement {
    const popup = document.createElement('div');
    const name = document.createElement('strong');
    name.textContent = customer.name;
    popup.append(name);
    for (const value of [customer.address, customer.phone]) {
      if (!value) continue;
      const line = document.createElement('p');
      line.textContent = value;
      popup.append(line);
    }
    return popup;
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.map?.remove();
  }
}
