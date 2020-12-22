import { Component, OnInit } from '@angular/core';
import { gameMech, SomeService } from '@end/client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [SomeService]
})
export class AppComponent implements OnInit {
  constructor(private api: SomeService) { }
  title = gameMech;

  ngOnInit() {
    this.api.name.subscribe(name => {
      this.title = name;
    })
  }
}
