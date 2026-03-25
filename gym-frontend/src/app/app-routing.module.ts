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
const routes: Routes = [
  { path: '', component: HomeComponent},
  { path: 'about', component: AboutComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'coach', component: CoachComponent },
  { path: 'compte', component: CompteComponent },
  { path: 'activite', component: ActiviteComponent },
  { path: 'offres', component: OffresComponent },
  { path: 'tarif', component: TarifComponent },
  { path: '**', component: NotFoundComponent },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },

  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
