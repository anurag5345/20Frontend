import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormArray,
  AbstractControl,
  ValidatorFn,
  FormGroup,
} from '@angular/forms';
import { InvoiceService } from '../../shared/services/invoice.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastService } from '../../shared/ui/toast.service';

@Component({
  selector: 'app-invoice-create',
  templateUrl: './invoice-create.component.html',
  styleUrls: ['./invoice-create.component.scss'],
  standalone: false,
})
export class InvoiceCreateComponent implements OnInit {
  form!: FormGroup;

  mode: 'create' | 'edit' = 'create';
  id?: number;

  constructor(
    private fb: FormBuilder,
    private srv: InvoiceService,
    private route: ActivatedRoute,
    private router: Router,
    private snack: MatSnackBar,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      invoiceNumber: ['', Validators.required],
      issueDate: [new Date(), Validators.required],
      dueDate: [null],
      phoneNumber: ['', [Validators.pattern(/^(?:\+91[-\s]?|0[-\s]?)?[6-9]\d{9}$/)]],
      customerName: ['', Validators.required],
      customerAddress: ['', Validators.required],
      taxType: ['intra'],
      items: this.fb.array([]),
    });
  }

  ngOnInit() {
    const dueCtrl = this.form.get('dueDate');
    if (dueCtrl) {
      dueCtrl.setValidators([this.dueDateValidator()]);
      dueCtrl.updateValueAndValidity({ onlySelf: true });
    }
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.mode = 'edit';
      this.id = +id;
      this.srv.get(this.id).subscribe((inv: any) => {
        this.form.patchValue({
          invoiceNumber: inv.invoiceNumber,
          issueDate: inv.issueDate
            ? new Date(inv.issueDate)
            : inv.date
            ? new Date(inv.date)
            : new Date(),
          dueDate: inv.dueDate ? new Date(inv.dueDate) : null,
          phoneNumber: inv.phoneNumber || '',
          customerName: inv.customerName,
          customerAddress: inv.customerAddress || '',
        } as any);
        this.items().clear();
        (inv.items || []).forEach((it: any) =>
          this.addItem(it.description, it.rate, it.unitPrice, it.gstRate)
        );
        if (this.items().length === 0) this.addItem();
      });
    } else {
      this.addItem();
    }
  }

  onlyToday = (d: Date | null): boolean => {
    if (!d) return false;
    const today = new Date();
    const da = new Date(d);
    da.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return da.getTime() >= today.getTime();
  };

  private isSameDay(a: Date | string, b: Date): boolean {
    const da = new Date(a);
    return (
      da.getFullYear() === b.getFullYear() &&
      da.getMonth() === b.getMonth() &&
      da.getDate() === b.getDate()
    );
  }

  private dueDateValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const val = control.value;
      if (!val) return null;
      const today = new Date();
      const d = new Date(val);
      d.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (d.getTime() >= today.getTime()) return null;
      return { dueDateBeforeToday: true };
    };
  }

  items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  newItem(d = '', r = 0, p = 0, g = 0) {
    const rate = r == null ? 1 : Number(r);
    const price = p == null ? 0 : Number(p);
    const gst = g == null ? 0 : Number(g);
    return this.fb.group({
      description: [d || '', Validators.required],
      rate: [rate, [Validators.required, this.numericMin(1)]],
      unitPrice: [price, [Validators.required, this.numericMin(1)]],
      gstRate: [gst, [Validators.required, Validators.min(0), Validators.max(28)]],
    });
  }

  private numericMin(min: number): ValidatorFn {
    return (control: AbstractControl) => {
      const val = control.value;
      if (val === null || val === undefined || val === '') return { required: true };
      const n = Number(val);
      if (Number.isNaN(n)) return { numeric: true };
      return n >= min ? null : { min: { requiredMin: min, actual: n } };
    };
  }

  addItem(d = '', r = 0, p = 0, g = 0) {
    this.items().push(this.newItem(d, r, p, g));
  }

  increment(index: number, field: 'rate' | 'unitPrice' | 'gstRate', delta: number) {
    const control = this.items()
      .at(index)
      .get(field as any);
    if (!control) return;
    let cur = Number(control.value) || 0;

    if (field === 'rate' || field === 'unitPrice') {
      cur = Math.round(cur);
      const newVal = cur + delta;
      control.setValue(Math.max(0, newVal));
    } else {
      const newVal = cur + delta * 0.5;
      control.setValue(Math.max(0, Number(newVal.toFixed(2))));
    }
  }

  focusField(index: number, type: string) {
    try {
      const id = type === 'desc' ? `desc-${index}` : `${type}-${index}`;
      const el: any = document.getElementById(id);
      if (el) el.focus();
    } catch (e) {
      console.warn('focusField failed', e);
    }
  }

  removeItem(i: number) {
    if (this.items().length > 1) this.items().removeAt(i);
  }

  get totals() {
    let subtotal = 0,
      gst = 0;
    for (const it of this.items().value) {
      const line = it.rate * it.unitPrice;
      const gamt = (line * (it.gstRate || 0)) / 100;
      subtotal += line;
      gst += gamt;
    }
    return { subtotal, gst, total: subtotal + gst };
  }

  submit() {
    if (this.form.invalid) {
      const messages = this.collectErrors();
      const msg = messages.length ? messages.join('\n') : 'Please fill all required fields';
      this.toast.error(msg, 4000);
      return;
    }

    const formValue = this.form.value;

    const payload = {
      invoiceNumber: formValue.invoiceNumber,
      issueDate: this.formatDate(formValue.issueDate)!,
      dueDate: formValue.dueDate ? this.formatDate(formValue.dueDate) : undefined,
      phoneNumber: formValue.phoneNumber || undefined,
      customerName: formValue.customerName,
      customerAddress: formValue.customerAddress,
      items: formValue.items?.map((it: any) => ({
        description: it.description,
        rate: Number(it.rate) || 0,
        unitPrice: Number(it.unitPrice) || 0,
        gstRate: Number(it.gstRate) || 0,
      })),
    };

    const request$ =
      this.mode === 'create' ? this.srv.create(payload) : this.srv.update(this.id!, payload);

    request$.subscribe({
      next: () => {
        this.toast.success('Invoice saved successfully', 1200);
        this.router.navigate(['/invoices']);
      },
      error: (err) => {
        console.error('Save failed:', err.error || err);
      },
    });
  }

  private collectErrors(): string[] {
    const msgs: string[] = [];
    const f = this.form;

    if (f.get('invoiceNumber')?.invalid) msgs.push('Invoice number is required.');
    if (f.get('issueDate')?.invalid) msgs.push('Issue date is required.');
    if (f.get('customerName')?.invalid) msgs.push('Customer name is required.');
    if (f.get('customerAddress')?.invalid) msgs.push('Customer address is required.');

    const phone = f.get('phoneNumber');
    if (phone?.invalid)
      msgs.push('Phone number is invalid. Use 10 digits, optionally prefixed with +91 or 0.');

    const itemsArray = this.items();
    const controls = itemsArray ? itemsArray.controls : [];
    if (!controls.length) msgs.push('Add at least one line item.');
    controls.forEach((it: any, i: number) => {
      if (it.get('description')?.invalid) msgs.push(`Item ${i + 1}: description required.`);
      if (it.get('rate')?.invalid) msgs.push(`Item ${i + 1}: rate must be at least 1.`);
      if (it.get('unitPrice')?.invalid)
        msgs.push(`Item ${i + 1}: unit price must be greater than 0.`);
      const gst = it.get('gstRate');
      if (gst?.invalid) {
        if (gst.errors?.max) msgs.push(`Item ${i + 1}: GST cannot be greater than 28%.`);
        else msgs.push(`Item ${i + 1}: GST is invalid.`);
      }
    });
    return msgs;
  }

  downloadPreview() {
    if (this.form.invalid) return;
    const fv = this.form.value;
    const payload = {
      invoiceNumber: fv.invoiceNumber,
      issueDate: this.formatDate(fv.issueDate)!,
      dueDate: fv.dueDate ? this.formatDate(fv.dueDate) : undefined,
      phoneNumber: fv.phoneNumber || undefined,
      customerName: fv.customerName,
      customerAddress: fv.customerAddress,
      items: fv.items?.map((it: any) => ({
        description: it.description,
        rate: Number(it.rate) || 0,
        unitPrice: Number(it.unitPrice) || 0,
        gstRate: Number(it.gstRate) || 0,
      })),
    };

    this.srv.previewPdf(payload).subscribe({
      next: (blob: any) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-preview.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Preview PDF failed', err);
      },
    });
  }

  private formatDate(date: Date | string | null | undefined): string | null {
    if (!date) return null;
    return new Date(date).toISOString();
  }
}
