import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-compte',
  template: `
    <div class="compte-container">
      <h2>Mon compte</h2>
      <p>Bienvenue sur votre espace personnel.</p>
      <div class="user-card" *ngIf="user">
        <p><strong>Nom:</strong> {{ user.name }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>Rôle:</strong> {{ user.role }}</p>
      </div>
      <button (click)="logout()" class="btn-logout">Se déconnecter</button>
    </div>
  `,
  styles: [`
    .compte-container { padding: 40px; text-align: center; color: white; background: var(--dark-bg); min-height: 80vh; }
    .user-card { background: var(--dark-surface); padding: 20px; border-radius: 8px; max-width: 400px; margin: 20px auto; text-align: left; }
    .btn-logout { background: var(--primary-red); color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-top: 20px; }
  `]
})
export class CompteComponent implements OnInit {
  user: any = null;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (!user) {
        this.router.navigate(['/login']);
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
