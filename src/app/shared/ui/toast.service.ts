import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BigSnackComponent } from './big-snack/big-snack.component';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor(private snack: MatSnackBar) {}

  success(message: string, duration = 3000) {
    this.snack.openFromComponent(BigSnackComponent, {
      data: { message, type: 'success' },
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
    });
  }

  error(message: string, duration = 4000) {
    this.snack.openFromComponent(BigSnackComponent, {
      data: { message, type: 'error' },
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
    });
  }

  info(message: string, duration = 3000) {
    this.snack.openFromComponent(BigSnackComponent, {
      data: { message, type: 'info' },
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
    });
  }
}
