import { Routes } from '@angular/router';
import { LoginComponent } from './feature/login/login.component';
import { RegisterComponent } from './feature/register/register.component';
import { InvoiceListComponent } from './feature/invoice-list/invoice-list.component';
import { InvoiceCreateComponent } from './feature/invoice-create/invoice-create.component';
import { InvoiceViewComponent } from './feature/invoice-view/invoice-view.component';
import { CustomersComponent } from './feature/customers/customers.component';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';
import { HomeComponent } from './feature/home/home.component';
import { NotFoundComponent } from './feature/not-found/not-found.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: HomeComponent },
  { path: 'login', component: LoginComponent, canActivate: [GuestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [GuestGuard] },
  {
    path: 'invoices',
    component: InvoiceListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'customers',
    component: CustomersComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'invoices/new',
    component: InvoiceCreateComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'invoices/:id',
    component: InvoiceViewComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'invoices/:id/edit',
    component: InvoiceCreateComponent,
    canActivate: [AuthGuard],
  },
  { path: '**', component: NotFoundComponent },
];
