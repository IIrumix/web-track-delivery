import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import { firstValueFrom, Subscription } from 'rxjs';
import { OrderSelectionService } from '../../../../service/order-selection.service';
import { OrderResponse } from '../../../../model/order-response';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule],
  selector: 'app-order-detail-panel',
  styleUrl: './order-detail-panel.css',
  templateUrl: './order-detail-panel.html',
})
export class OrderDetailPanel implements AfterViewInit, OnDestroy {
  @Input() selectedData: unknown = null;
  private readonly orderSelection = inject(OrderSelectionService);
  private readonly http = inject(HttpClient);
  readonly order = this.orderSelection.selectedOrder;
  @ViewChild('mapContainer', { static: true }) private mapContainer!: ElementRef<HTMLDivElement>;
  private map: L.Map | null = null;
  private markerGroup: L.FeatureGroup | null = null;
  private orderMarkers: { orderId: number; marker: L.Marker }[] = [];
  private dataSubscription: Subscription;
  editMode = false;
  saving = false;
  editQuantity = 0;
  pinCount = 0;

  constructor(private changeDetector: ChangeDetectorRef) {
    this.dataSubscription = this.orderSelection.changes.subscribe((action) => {
      if (action === 'loaded') this.drawOrderPins();
      if (action === 'selected') this.goToOrder(this.order());
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
    this.drawOrderPins();
    this.goToOrder(this.order());
  }

  ToggleEditOrderMode() {
    if (!this.order()) return;

    this.editMode = !this.editMode;
    if (this.editMode) {
      this.editQuantity = this.order()?.quantity ?? 0;
    }
  }

  async saveOrder() {
    const order = this.order();
    if (!order || this.saving) return;

    const quantity = Number(this.editQuantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 3) {
      console.error('จำนวนกล่องต้องเป็นจำนวนเต็มระหว่าง 1 ถึง 3');
      return;
    }

    this.saving = true;
    try {
      await firstValueFrom(
        this.http.put(`/api/orders/${order.order_id}`, {
          quantity,
        }),
      );

      await this.orderSelection.loadOrders();
      const updatedOrder = this.orderSelection
        .orders()
        .find((item) => item.order_id === order.order_id);
      if (updatedOrder) this.orderSelection.select(updatedOrder);
      this.editMode = false;
    } catch (error) {
      console.error(`บันทึก Order #${order.order_id} ไม่สำเร็จ`, error);
    } finally {
      this.saving = false;
    }
  }

  // สีหมุดมาจากจำนวนกล่อง โดยรูปหมุดมีตัวเลขกำกับด้วย
  private drawOrderPins(): void {
    if (this.markerGroup === null) return;
    this.markerGroup.clearLayers();
    this.orderMarkers = [];
    this.pinCount = 0;

    for (const order of this.orderSelection.orders()) {
      const coordinates = this.orderSelection.getCoordinates(order);
      const quantity = Number(order.quantity);
      if (coordinates === null || ![1, 2, 3].includes(quantity)) continue;

      const icon = L.icon({
        iconUrl: 'order-pin-' + quantity + '.svg',
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -35],
      });
      const marker = L.marker(coordinates, {
        icon: icon,
        title: 'Order #' + order.order_id + ' - ' + quantity + ' กล่อง',
        alt: 'ออเดอร์ ' + order.order_id + ' จำนวน ' + quantity + ' กล่อง',
      });
      marker.bindPopup(this.createPopup(order));
      marker.on('click', () => this.orderSelection.select(order));
      this.markerGroup.addLayer(marker);
      this.orderMarkers.push({ orderId: order.order_id, marker: marker });
      this.pinCount++;
    }
    this.showAll();
  }

  private goToOrder(order: OrderResponse | null): void {
    if (order === null || this.map === null) return;
    const coordinates = this.orderSelection.getCoordinates(order);
    if (coordinates === null) return;
    this.map.setView(coordinates, 16);
    for (const item of this.orderMarkers) {
      if (item.orderId === order.order_id) {
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

  private createPopup(order: OrderResponse): HTMLElement {
    const popup = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = 'Order #' + order.order_id;
    popup.appendChild(title);
    for (const value of [order.name, order.quantity + ' กล่อง', order.address, order.phone]) {
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

  get profit(): number {
    const order = this.order();
    if (!order) return 0;

    return (+order.unit_price - +order.unit_cost) * order.quantity;
  }
}
