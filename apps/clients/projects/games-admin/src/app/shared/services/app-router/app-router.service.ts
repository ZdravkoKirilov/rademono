import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AppRouterService {
  constructor(private router: Router) {}

  goToHome() {
    return this.router.navigate(['/home']);
  }

  goToLogin() {
    return this.router.navigate(['/users/auth/signin']);
  }
}
