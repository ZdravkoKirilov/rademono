import { Component } from '@angular/core';

import { gosho } from '@libs/game-mechanics';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = gosho;
}
