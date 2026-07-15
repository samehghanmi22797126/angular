import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  template: `
    <header class="app-header">
      <nav class="nav-container">
        <div class="logo">
          <a routerLink="/">
            <img src="assets/logo.png" alt="Apex Performance Logo" class="logo-img">
            <span class="logo-text">APEX<span class="highlight"> PERFORMANCE</span></span>
          </a>
        </div>
        
        <div class="nav-links-wrapper">
          <ul class="nav-links">
            <li><a routerLink="/home" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact:true}">Accueil</a></li>
            <li><a routerLink="/tarif" routerLinkActive="active-link">Tarifs</a></li>
            <li><a routerLink="/offres" routerLinkActive="active-link">Offres</a></li>
            <li><a routerLink="/activite" routerLinkActive="active-link">Activités</a></li>
            <li><a routerLink="/about" routerLinkActive="active-link">À propos</a></li>
          </ul>

          <div class="auth-box">
            <ng-container *ngIf="!isLoggedIn">
              <a routerLink="/login" class="nav-auth-btn">Connexion</a>
              <a routerLink="/register" class="btn-primary-sm">S'inscrire</a>
            </ng-container>
            
            <ng-container *ngIf="isLoggedIn">
              <div class="user-menu">
                <a *ngIf="userRole === 'admin'" routerLink="/admin" class="role-badge admin">Admin</a>
                <a *ngIf="userRole === 'member'" routerLink="/member" class="role-badge member">Mon Espace</a>
                <a *ngIf="userRole === 'coach'" routerLink="/coach" class="role-badge coach">Coach</a>
                <button (click)="logout()" class="logout-btn" title="Se déconnecter">
                  <span class="icon">🚪</span>
                </button>
              </div>
            </ng-container>
          </div>
        </div>
      </nav>
    </header>
  `,
  styles: [`
    .app-header {
      background-color: rgba(11, 11, 11, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      color: white;
      padding: 0.8rem 2rem;
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .nav-container {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo a {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: white;
      transition: transform 0.3s ease;
    }
    
    .logo a:hover { transform: scale(1.02); }

    .logo-img { height: 40px; width: auto; object-fit: contain; }

    .logo-text {
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: -1px;
    }

    .highlight { color: var(--primary-red, #e61919); }

    .nav-links-wrapper {
      display: flex;
      align-items: center;
      gap: 40px;
    }

    .nav-links {
      list-style: none;
      display: flex;
      gap: 25px;
      margin: 0;
      padding: 0;
    }

    .nav-links li a {
      color: #ccc;
      text-decoration: none;
      font-size: 0.95rem;
      font-weight: 600;
      text-transform: uppercase;
      padding: 5px 0;
      position: relative;
      transition: color 0.3s ease;
    }

    .nav-links li a::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background-color: var(--primary-red, #e61919);
      transition: width 0.3s ease;
    }

    .nav-links li a:hover, .nav-links li a.active-link {
      color: white;
    }

    .nav-links li a:hover::after, .nav-links li a.active-link::after {
      width: 100%;
    }

    .auth-box {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .nav-auth-btn {
      color: white;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.95rem;
    }

    .btn-primary-sm {
      background-color: var(--primary-red, #e61919);
      color: white;
      padding: 8px 20px;
      border-radius: 4px;
      text-decoration: none;
      font-weight: bold;
      font-size: 0.9rem;
      text-transform: uppercase;
      transition: all 0.3s ease;
    }

    .btn-primary-sm:hover {
      background-color: #ff3333;
      box-shadow: 0 4px 12px rgba(230, 25, 25, 0.4);
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .role-badge {
      padding: 5px 12px;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: bold;
      text-decoration: none;
      text-transform: uppercase;
    }

    .admin { background: rgba(255, 193, 7, 0.1); color: #ffc107; border: 1px solid #ffc107; }
    .member { background: rgba(0, 123, 255, 0.1); color: #007bff; border: 1px solid #007bff; }
    .coach { background: rgba(40, 167, 69, 0.1); color: #28a745; border: 1px solid #28a745; }

    .logout-btn {
      background: none;
      border: 1px solid rgba(255,255,255,0.2);
      color: white;
      cursor: pointer;
      padding: 5px 10px;
      border-radius: 4px;
      transition: all 0.3s;
    }

    .logout-btn:hover { background: rgba(255,255,255,0.1); }

    @media (max-width: 992px) {
      .nav-links-wrapper { display: none; }
    }
  `]
})
export class HeaderComponent implements OnInit {
  isLoggedIn: boolean = false;
  userRole: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.userRole = user && user.role ? user.role.toLowerCase() : '';
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
