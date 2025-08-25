import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './shared/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastService } from './shared/ui/toast.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(
    private auth: AuthService,
    private router: Router,
    private snack: MatSnackBar,
    private toast: ToastService
  ) {}

  isLoggedIn() {
    return this.auth.isLoggedIn();
  }

  logout() {
    this.auth.logout();
    this.toast.info('Logged out', 2000);
    this.router.navigate(['/']);
  }
}
