import { Component } from '@angular/core';
import { gosho } from '@client/shared';
import { gameMech } from '@global/shared';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = gosho;
  title2 = gameMech;
}
