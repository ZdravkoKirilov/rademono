import { Component } from '@angular/core';

@Component({
  selector: 'app-buttons',
  templateUrl: './buttons.component.html',
  styleUrls: ['./buttons.component.scss'],
})
export class ButtonsComponent {
  state1: any;
  state2: any;

  fetch1() {
    this.state1 = 'loading';

    setTimeout(() => {
      this.state1 = 'loaded';
    }, 2000);
  }

  fetch2() {
    this.state2 = 'loading';

    setTimeout(() => {
      this.state2 = 'error';
    }, 2000);
  }
}
