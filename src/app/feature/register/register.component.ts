import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastService } from '../../shared/ui/toast.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: false,
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  error = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private snack: MatSnackBar,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });

    // add cross-field validator for password match
    this.registerForm.setValidators(this.passwordsMatchValidator);
  }

  register() {
    if (this.registerForm.invalid) {
      this.error = 'Please fill all required fields correctly.';
      return;
    }

    // send only required fields to API (exclude confirmPassword)
    const { name, email, password } = this.registerForm.value;
    this.auth.register({ name, email, password }).subscribe({
      next: () => {
        this.toast.success('Registration successful! Please login.', 3000);
        this.registerForm.reset();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Registration failed';
      },
    });
  }
  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  // custom validator to ensure password and confirmPassword match
  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const pass = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;
    if (pass && confirm && pass !== confirm) {
      return { passwordsMismatch: true };
    }
    return null;
  }
}
