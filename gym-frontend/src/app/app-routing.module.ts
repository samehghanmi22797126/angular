import { NgModule } from '@angular/core';
import { OffresComponent } from './offres/offres.component';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { CoachComponent } from './coach/coach.component';
import { CompteComponent } from './compte/compte.component';
import { ActiviteComponent } from './activite/activite.component';
import { TarifComponent } from './tarif/tarif.component';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { MemberComponent } from './member/member.component';
import { PaymentComponent } from './components/payment/payment.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
  { path: 'about', component: AboutComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'coach', 
    component: CoachComponent, 
    canActivate: [AuthGuard], 
    data: { role: 'coach' } 
  },
  { 
    path: 'compte', 
    component: CompteComponent, 
    canActivate: [AuthGuard] 
  },
  { path: 'activite', component: ActiviteComponent },
  { path: 'offres', component: OffresComponent },
  { path: 'tarif', component: TarifComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'chatbot', component: ChatbotComponent },
  { 
    path: 'member', 
    component: MemberComponent, 
    canActivate: [AuthGuard], 
    data: { role: 'member' } 
  },
  { 
    path: 'payment', 
    component: PaymentComponent, 
    canActivate: [AuthGuard] 
  },
  
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard],
    data: { role: 'admin' }
  },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
