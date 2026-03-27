import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  template: `
    <header class="app-header">
      <nav class="nav-container">
        <div class="logo">
          <a routerLink="/">🏋️‍♂️ sale_sport</a>
        </div>
        <ul class="nav-links">
          <li><a routerLink="/home" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact:true}">Home</a></li>
          <li><a routerLink="/tarif" routerLinkActive="active-link">Tarif</a></li>
          <li><a routerLink="/offres" routerLinkActive="active-link">Offres</a></li>
          <li><a routerLink="/activite" routerLinkActive="active-link">Activité</a></li>
          <li><a routerLink="/about" routerLinkActive="active-link">About</a></li>
          <li *ngIf="!isLoggedIn"><a routerLink="/login">Connexion</a></li>
          <li *ngIf="!isLoggedIn"><a routerLink="/register">Inscription</a></li>
          <li *ngIf="isLoggedIn"><a (click)="logout()">Déconnexion</a></li>
          <li *ngIf="isLoggedIn && userRole==='Admin'"><a routerLink="/admin">Admin</a></li>
          <li *ngIf="isLoggedIn && userRole==='Member'"><a routerLink="/member">Mon Espace</a></li>
          <li *ngIf="isLoggedIn && userRole==='Coach'"><a routerLink="/coach">Coach</a></li>
        </ul>
      </nav>
    </header>
  `,
  styles: [`
    :host { display:block; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .app-header { background: linear-gradient(90deg,#1976d2,#42a5f5); color:white; padding:0.5rem 2rem; position:sticky; top:0; z-index:1000; box-shadow:0 2px 8px rgba(0,0,0,0.2);}
    .nav-container { display:flex; justify-content:space-between; align-items:center;}
    .logo a { font-size:1.5rem; font-weight:bold; color:white; text-decoration:none; }
    .nav-links { list-style:none; display:flex; gap:1rem; margin:0; padding:0; }
    .nav-links li a { color:white; text-decoration:none; padding:0.4rem 0.8rem; border-radius:5px; transition:background 0.3s, transform 0.2s; }
    .nav-links li a:hover { background: rgba(255,255,255,0.2); transform:scale(1.05); }

    /* Style du lien actif */
    .nav-links li a.active-link {
      background-color: rgba(255, 255, 255, 0.3);
      font-weight: bold;
      transform: scale(1.05);
    }

    @media (max-width:600px){
      .nav-container{flex-direction:column; align-items:flex-start;} 
      .nav-links{flex-direction:column;width:100%;} 
      .nav-links li a{display:block;width:100%; text-align:left; padding:0.5rem 1rem;} 
    }
  `]
})
export class HeaderComponent {
  isLoggedIn: boolean = false;
  userRole: string = '';

  logout() {
    this.isLoggedIn = false;
    this.userRole = '';
  }
}
