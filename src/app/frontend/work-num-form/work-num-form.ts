import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  imports: [],
  selector: 'app-work-num-form',
  styleUrl: './work-num-form.css',
  templateUrl: './work-num-form.html',
})
export class WorkNumForm {
  private readonly router = inject(Router);
  readonly workNumber = signal('');
  readonly error = signal('');

  openWork(event: Event): void {
    event.preventDefault();
    const workNumber = this.workNumber().trim();
    if (!workNumber) {
      this.error.set('กรุณากรอกเลขใบงาน');
      return;
    }
    this.error.set('');
    void this.router.navigate(['/rider', workNumber]);
  }
}
