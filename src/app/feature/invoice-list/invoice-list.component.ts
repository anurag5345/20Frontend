import { Component, OnInit } from '@angular/core';
import { InvoiceService } from '../../shared/services/invoice.service';
import { Router } from '@angular/router';
import { ToastService } from '../../shared/ui/toast.service';
import { ConfirmDialogComponent } from '../../shared/ui/confirm-snack/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss'],
  standalone: false,
})
export class InvoiceListComponent implements OnInit {
  invoices: any[] = [];
  loading = false;
  searchText = '';
  statusFilter: 'all' | 'paid' | 'unpaid' = 'all';
  page = 1;
  limit = 5;
  total = 0;
  constructor(
    private srv: InvoiceService,
    private router: Router,
    private toast: ToastService,
    private dialog: MatDialog
  ) {}
  ngOnInit() {
    this.fetch();
  }

  get filteredInvoices() {
    const q = (this.searchText || '').trim().toLowerCase();
    let list = this.invoices.slice();
    if (this.statusFilter === 'paid') {
      list = list.filter((i) => (i.status ? i.status === 'paid' : !!i.paid));
    } else if (this.statusFilter === 'unpaid') {
      list = list.filter((i) => (i.status ? i.status === 'unpaid' : !i.paid));
    }

    if (!q) return list;
    return list.filter((inv) =>
      String(inv.customerName || '')
        .toLowerCase()
        .includes(q)
    );
  }
  fetch() {
    this.loading = true;
    const opts: any = { page: this.page, limit: this.limit };
    if (this.searchText) opts.search = this.searchText;
    if (this.statusFilter && this.statusFilter !== 'all') opts.status = this.statusFilter;

    this.srv.list(opts).subscribe({
      next: (res: any) => {
        if (res && res.data && Array.isArray(res.data)) {
          this.invoices = res.data;
          this.total = res.meta?.total ?? this.total;
        } else if (Array.isArray(res)) {
          this.invoices = res;
          this.total = res.length;
        } else {
          this.invoices = [];
          this.total = 0;
        }
      },
      error: () => {},
      complete: () => (this.loading = false),
    });
  }
  view(id: number) {
    this.router.navigate(['/invoices', id]);
  }
  edit(id: number) {
    this.router.navigate(['/invoices', id, 'edit']);
  }

  toggleStatus(inv: any) {
    const id = inv.id;
    const current = inv.status || (inv.paid ? 'paid' : 'unpaid');

    if (current === 'paid') {
      this.toast.info('Invoice already paid');
      return;
    }

    const newStatus = 'paid';
    this.srv.update(id, { status: newStatus }).subscribe({
      next: () => {
        this.toast.success(`Marked as ${newStatus}`, 1500);
        this.fetch();
      },
      error: () => {},
    });
  }
  delete(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.srv.delete(id).subscribe({
          next: () => {
            this.toast.error('Invoice deleted', 1800);
            this.fetch();
          },
          error: (err) => {
            console.error('Delete failed', err);
            this.toast.error('Failed to delete invoice');
          },
        });
      }
    });
  }

  togglePaid(inv: any) {
    const id = inv.id;
    if (inv.paid) {
      this.toast.info('Invoice already paid');
      return;
    }

    this.srv.update(id, { paid: true }).subscribe({
      next: () => {
        this.toast.success('Marked as paid', 1500);
        this.fetch();
      },
      error: () => {},
    });
  }

  onPageEvent(event: PageEvent) {
    this.limit = event.pageSize;
    this.page = event.pageIndex + 1; 
    this.fetch();
  }

  onFilterChange() {
    this.page = 1;
    this.fetch();
  }

  get startIndex() {
    return (this.page - 1) * this.limit + 1;
  }

  get endIndex() {
    return Math.min(this.page * this.limit, this.total);
  }
}
