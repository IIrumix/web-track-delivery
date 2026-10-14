import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-work-num-form',
  styleUrl: './work-num-form.css',
  templateUrl: './work-num-form.html',
})
export class WorkNumForm {

  secretKey: string = 'iwantA';

  secretOwnerPage(workNumInput: HTMLInputElement) {
    if (workNumInput.value === this.secretKey) {
      window.location.href = '/owner-gui';
    } else {
      window.location.href = '/driver-gui';
    }
  }

}
