import { Component, OnInit } from '@angular/core';
import { InvoiceService } from '../../shared/services/invoice.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-invoice-view',
  templateUrl: './invoice-view.component.html',
  styleUrls: ['./invoice-view.component.scss'],
  standalone: false,
})
export class InvoiceViewComponent implements OnInit {
  invoice: any;
  id: number;
  downloading = false;
  constructor(private srv: InvoiceService, private route: ActivatedRoute, private router: Router) {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
  }
  ngOnInit() {
    if (!this.id) {
      this.router.navigate(['/invoices']);
      return;
    }
    this.srv.get(this.id).subscribe((inv: any) => (this.invoice = inv));
  }

  downloadPdf() {
    this.downloading = true;
    this.srv.downloadPdf(this.id).subscribe({
      next: (blob: any) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${this.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Download failed', err);
      },
      complete: () => (this.downloading = false),
    });
  }
}
