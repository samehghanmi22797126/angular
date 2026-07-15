import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private apiUrl = 'http://localhost:5280/api/payments';

  constructor(private http: HttpClient) { }

  /**
   * Envoie une requête de paiement sécurisée au backend (qui s'interface avec Stripe).
   * @param paymentData Les données requises pour le paiement (token de carte Stripe, ID de souscription, montant, etc.).
   * @returns Un Observable contenant le statut et les détails du paiement effectué.
   */
  processPayment(paymentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/process`, paymentData);
  }
}
