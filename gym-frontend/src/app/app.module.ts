import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { CoachComponent } from './coach/coach.component';
import { CompteComponent } from './compte/compte.component';
import { ActiviteComponent } from './activite/activite.component';
import { TarifComponent } from './tarif/tarif.component';
import { OffresComponent } from './offres/offres.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent,
    HeaderComponent,
    FooterComponent,
    NotFoundComponent,
    LoginComponent,
    RegisterComponent,
    CoachComponent,
    CompteComponent,
    ActiviteComponent,
    TarifComponent,
    OffresComponent
    // Supprime AdminComponent ici !
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
    // AdminModule sera lazy loaded via routing
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
