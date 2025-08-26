import { Component, OnInit } from '@angular/core';
import { InvoiceService } from '../../shared/services/invoice.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: false,
})
export class HomeComponent implements OnInit {
  totalInvoices: number | null = null;
  totalDue: number | null = null;
  customerCount: number | null = null;
  recentInvoices: any[] = [];

  constructor(private srv: InvoiceService, private router: Router) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.srv.list().subscribe(
      (res: any) => {
        const arr = (res as any[]) || [];
        this.totalInvoices = arr.length;
        const customers = new Set(arr.map((r) => r.customerName));
        this.customerCount = customers.size;
        const unpaid = arr.filter((r: any) => (r.status ? r.status !== 'paid' : !r.paid));
        this.totalDue = unpaid.reduce((acc, r) => acc + (Number(r.totalWithGST) || 0), 0);
        this.recentInvoices = arr
          .slice()
          .sort((a: any, b: any) => {
            const da = new Date(a.issueDate).getTime() || 0;
            const db = new Date(b.issueDate).getTime() || 0;
            return db - da;
          })
          .slice(0, 2);
      },
      () => {
        this.totalInvoices = 0;
        this.customerCount = 0;
        this.totalDue = 0;
      }
    );
  }

  view(inv: any) {
    if (!inv || !inv.id) return;
    this.router.navigate(['/invoices', inv.id]);
  }
}
