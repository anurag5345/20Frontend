import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastService } from '../../shared/ui/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false,
  encapsulation: ViewEncapsulation.None,
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  error = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private snack: MatSnackBar,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.email = '';
    this.password = '';
    this.error = '';
  }

  login() {
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.email = '';
        this.password = '';
        this.error = '';
        this.toast.success('Login successful', 2000);
        this.router.navigate(['/invoices']);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Login failed';
      },
    });
  }
  navigateToSignup() {
    this.router.navigate(['/register']);
  }
}
