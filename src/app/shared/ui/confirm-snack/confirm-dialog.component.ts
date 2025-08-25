import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  standalone: false,
  template: `
    <div class="dialog-wrapper">
      <h2>Confirm Delete</h2>
      <p>Are you sure you want to delete this invoice?</p>
      <div class="dialog-actions">
        <button class="btn cancel" (click)="onNo()">No</button>
        <button class="btn delete" (click)="onYes()">Yes</button>
      </div>
    </div>
  `,
  styles: [
    `
      /* Override Angular Material dialog container */
      ::ng-deep .mat-mdc-dialog-container .mdc-dialog__surface {
        background: transparent !important;
        box-shadow: none !important;
      }

      .dialog-wrapper {
        width: 100%;
        max-width: 420px;
        margin: auto;
        background: transparent;
        border: 2px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(9px);
        -webkit-backdrop-filter: blur(9px);
        color: #fff;
        border-radius: 12px;
        padding: 30px 40px;
        box-sizing: border-box;
        text-align: center;
      }

      .dialog-wrapper h2 {
        font-size: 26px;
        margin-bottom: 15px;
      }

      .dialog-wrapper p {
        font-size: 16px;
        margin-bottom: 25px;
        color: #ddd;
      }

      .dialog-actions {
        display: flex;
        justify-content: center;
        gap: 15px;
      }

      .btn {
        min-width: 100px;
        height: 40px;
        border: none;
        border-radius: 40px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: 0.3s ease;
      }

      .btn.cancel {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }

      .btn.cancel:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .btn.delete {
        background: #ff4d4d;
        color: #fff;
      }

      .btn.delete:hover {
        background: #e63939;
      }

      @media (max-width: 576px) {
        .dialog-wrapper {
          padding: 20px;
          border-radius: 8px;
        }
        .dialog-wrapper h2 {
          font-size: 22px;
        }
        .dialog-wrapper p {
          font-size: 14px;
        }
        .btn {
          font-size: 14px;
          height: 36px;
          min-width: 80px;
        }
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onYes() {
    this.dialogRef.close(true);
  }

  onNo() {
    this.dialogRef.close(false);
  }
}
