import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="app-footer">
      <div class="footer-content">
        <div class="footer-brand">
          <h3>APEX<span class="highlight"> PERFORMANCE</span></h3>
          <p>Dépasse tes limites, transforme ton corps.</p>
        </div>
        <div class="footer-links">
          <a routerLink="/about">À propos</a>
          <a routerLink="/tarif">Tarifs</a>
          <a routerLink="/offres">Offres</a>
        </div>
        <div class="footer-social">
          <span class="social-icon">📱</span>
          <span class="social-icon">📸</span>
          <span class="social-icon">📘</span>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 Apex Performance. Tous droits réservés.</p>
      </div>
    </footer>
  `,
  styles: [`
    .app-footer {
      background-color: #050505;
      color: #888;
      padding: 60px 20px 20px;
      border-top: 1px solid rgba(255,255,255,0.05);
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 40px;
      margin-bottom: 40px;
    }

    .footer-brand h3 {
      color: white;
      margin-bottom: 15px;
    }

    .highlight { color: var(--primary-red, #e61919); }

    .footer-brand p {
      font-size: 0.9rem;
      max-width: 300px;
    }

    .footer-links {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .footer-links a {
      color: #888;
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.3s;
    }

    .footer-links a:hover { color: white; }

    .footer-social {
      display: flex;
      gap: 15px;
    }

    .social-icon {
      font-size: 1.5rem;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.3s;
    }

    .social-icon:hover { opacity: 1; }

    .footer-bottom {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.05);
      font-size: 0.8rem;
    }
  `]
})
export class FooterComponent { }
