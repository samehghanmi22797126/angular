import { Component } from '@angular/core';

@Component({
  selector: 'app-compte',
  template: `
    <h2>Mon compte</h2>
    <p>Bienvenue sur votre espace personnel.</p>
    <pre *ngIf="user">{{ user | json }}</pre>
    <button *ngIf="user" (click)="logout()">Se déconnecter</button>
  `
})
export class CompteComponent {
  user: any = null;
  constructor() {
    try { this.user = JSON.parse(localStorage.getItem('user') || 'null'); } catch { this.user = null; }
  }

  logout() {
    localStorage.removeItem('user');
    window.location.href = '/';
  }
}
