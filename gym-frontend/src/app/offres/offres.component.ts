import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OffreService, Offre } from './offres.service';  // Chemin corrigé (même dossier)
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-offres',
  templateUrl: './offres.component.html',
  styleUrls: ['./offres.component.css']
})
export class OffresComponent implements OnInit {
  offres: Offre[] = [];
  loading: boolean = true;
  errorMessage: string = '';
  successMessage: string = '';
  selectedOffre: Offre | null = null;
  showSubscribeModal: boolean = false;
  subscribing: boolean = false;

  constructor(
    private offreService: OffreService,
    private authService: AuthService,
    private router: Router
  ) { }

  get isMember(): boolean {
    const user = this.authService.getCurrentUser();
    // On permet aux invités (non connectés) de voir, mais on bloque Coach/Admin
    return !user || user.role === 'member';
  }

  ngOnInit(): void {
    this.loadOffres();
  }

  loadOffres(): void {
    this.loading = true;
    this.offreService.getActiveOffres().subscribe({
      next: (data: Offre[]) => {
        this.offres = data.map(o => ({
          ...o,
          features: typeof o.featuresJson === 'string' ? JSON.parse(o.featuresJson) : []
        }));
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur chargement offres:', error);
        this.errorMessage = 'Impossible de charger les offres';
        this.loading = false;
      }
    });
  }

  openSubscribeModal(offre: Offre): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/offres' } });
      return;
    }
    this.selectedOffre = offre;
    this.showSubscribeModal = true;
  }

  closeModal(): void {
    this.showSubscribeModal = false;
    this.selectedOffre = null;
    this.successMessage = '';
    this.errorMessage = '';
  }

  confirmSubscription() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/offres' } });
      return;
    }

    if (!this.selectedOffre) return;

    // Redirection vers la page de paiement avec les paramètres
    this.router.navigate(['/payment'], {
      queryParams: {
        planId: this.selectedOffre.id,
        name: this.selectedOffre.name,
        price: this.selectedOffre.price
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
  }

  getDurationText(months: number): string {
    if (months === 1) return '1 mois';
    if (months === 3) return '3 mois';
    if (months === 6) return '6 mois';
    if (months === 12) return '12 mois';
    return `${months} mois`;
  }
}
