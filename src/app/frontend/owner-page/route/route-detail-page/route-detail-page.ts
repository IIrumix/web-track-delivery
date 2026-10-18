import { Component, inject,} from '@angular/core';
import { RouteService } from '../../../../service/route.service';

@Component({
  imports: [],
  selector: 'app-route-detail-page',
  styleUrl: './route-detail-page.css',
  templateUrl: './route-detail-page.html',
  host: { class: 'z-10 block w-full h-full' },
})
export class RouteDetailPage {
  RouteService = inject(RouteService);
}
