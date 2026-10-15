import { Component } from '@angular/core';
import { DriverGui } from '../driver-gui/driver-gui';

@Component({
  selector: 'app-rider-work',
  imports: [DriverGui],
  host: { class: 'block' },
  templateUrl: './rider-work.html',
  styleUrl: './rider-work.css',
})
export class RiderWork {}
