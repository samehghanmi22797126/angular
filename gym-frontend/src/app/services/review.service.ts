import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = 'http://localhost:5280/api/reviews';

  constructor(private http: HttpClient) { }

  /**
   * Récupère tous les avis et témoignages publiés par les membres de la salle de sport.
   * Filtre automatiquement l'enveloppe `$values` de la réponse API.
   * @returns Un Observable contenant le tableau complet des avis d'utilisateurs.
   */
  getReviews(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => res.$values || res)
    );
  }

  /**
   * Enregistre un nouvel avis d'utilisateur en base de données (action généralement réservée aux membres connectés).
   * @param review Les données de l'avis contenant la note (rating) et le commentaire (content).
   * @returns Un Observable contenant l'avis nouvellement créé.
   */
  postReview(review: any): Observable<any> {
    return this.http.post(this.apiUrl, review);
  }
}
