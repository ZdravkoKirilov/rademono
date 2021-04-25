import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-home-dashboard',
  templateUrl: './home-dashboard.component.html',
  styleUrls: ['./home-dashboard.component.scss'],
  host: { class: 'full-container' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeDashboardComponent {}
