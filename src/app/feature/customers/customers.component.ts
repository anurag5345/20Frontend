import { Component, OnInit } from '@angular/core';
import { InvoiceService } from '../../shared/services/invoice.service';

type CustomerRow = {
  name: string;
  phone?: string;
  status?: string;
  total: number;
  invoices: number;
};

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
  standalone: false,
})
export class CustomersComponent implements OnInit {
  rows: CustomerRow[] = [];
  loading = true;
  error: string | null = null;

  constructor(private srv: InvoiceService) {}

  ngOnInit() {
    this.srv.list().subscribe({
      next: (res: any) => {
        const arr = Array.isArray(res) ? res : res?.data || [];
        const map = new Map<string, CustomerRow>();
        for (const inv of arr || []) {
          const name = String(inv.customerName || 'Unknown');
          const existing = map.get(name) || {
            name,
            phone: inv.phoneNumber || inv.phone || undefined,
            status: inv.status || 'active',
            total: 0,
            invoices: 0,
          };

          let lineTotal = 0;
          if (inv.totalWithGST != null) {
            lineTotal = Number(inv.totalWithGST) || 0;
          } else if (Array.isArray(inv.items) && inv.items.length) {
            lineTotal = inv.items.reduce(
              (s: number, it: any) => s + (Number(it.rate) || 0) * (Number(it.unitPrice) || 0),
              0
            );
            if (inv.gst != null) lineTotal += Number(inv.gst) || 0;
          }

          existing.total += lineTotal;
          existing.invoices += 1;
          if (!existing.phone && (inv.phoneNumber || inv.phone))
            existing.phone = inv.phoneNumber || inv.phone;
          map.set(name, existing);
        }
        this.rows = Array.from(map.values());
        this.loading = false;
      },
      error: (err) => {
        console.error('Customers load failed', err);
        this.error = err?.message || 'Failed to load customers';
        this.loading = false;
      },
    });
  }
}
