import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-big-snack',
  
  standalone: false,
  template: `
    <div class="big-snack {{ data.type || '' }}">
      <div class="icon" *ngIf="data.type === 'success'">✔</div>
      <div class="icon" *ngIf="data.type === 'error'">✖</div>
      <div class="message">{{ data.message }}</div>
    </div>
  `,
  styles: [
    `
      .big-snack {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
        font-size: 16px;
        color: #fff;
        border-radius: 8px;
        min-width: 320px;
        max-width: 720px;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
      }
      .big-snack .icon {
        font-size: 20px;
      }
      .big-snack.success {
        background: linear-gradient(90deg, #4caf50, #66bb6a);
      }
      .big-snack.error {
        background: linear-gradient(90deg, #e53935, #ef5350);
      }
      .big-snack .message {
        font-weight: 600;
      }
    `,
  ],
})
export class BigSnackComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {}
}
