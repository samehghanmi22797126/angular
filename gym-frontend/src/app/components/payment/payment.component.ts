import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BillingService } from '../../services/billing.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  planId: number = 0;
  planName: string = '';
  price: number = 0;
  
  cardNumber: string = '';
  expiryDate: string = '';
  cvv: string = '';
  
  loading: boolean = false;
  success: boolean = false;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private billingService: BillingService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.planId = +params['planId'];
      this.planName = params['name'] || 'Abonnement';
      this.price = +params['price'] || 0;
      
      if (!this.planId) {
        this.router.navigate(['/offres']);
      }
    });

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/payment', ...this.route.snapshot.queryParams } });
    }
  }

  onSubmit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.loading = true;
    this.errorMessage = '';

    const payload = {
      memberId: user.id,
      planId: this.planId,
      cardNumber: this.cardNumber,
      expiryDate: this.expiryDate,
      cvv: this.cvv
    };

    this.billingService.processPayment(payload).subscribe({
      next: (res) => {
        this.loading = false;
        this.success = true;
        // Optionnel: mettre à jour l'utilisateur en local si besoin
        setTimeout(() => {
          this.router.navigate(['/member']);
        }, 3000);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = "Une erreur est survenue lors du paiement. Veuillez réessayer.";
      }
    });
  }
}
