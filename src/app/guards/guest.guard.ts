import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';

@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  canActivate(): boolean {
    if (!this.auth.isLoggedIn()) {
      return true;
    }

    try {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        this.router.navigate(['/']);
      }
    } catch (e) {
      this.router.navigate(['/']);
    }
    return false;
  }
}
