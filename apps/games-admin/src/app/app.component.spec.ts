import { RouterTestingModule } from '@angular/router/testing';
import { render, screen } from '@testing-library/angular';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('should have correct title', async () => {
    await render(AppComponent, {
      imports: [RouterTestingModule],
      declarations: [AppComponent],
    });

    expect(screen.getByRole('heading', { name: 'title app is running!' }));
  });
});
