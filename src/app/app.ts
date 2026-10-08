import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WorkNumForm } from './frontend/work-num-form/work-num-form';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, WorkNumForm],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('web-track-delivery');
}
