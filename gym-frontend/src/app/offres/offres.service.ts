import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Offre {
  id: number;
  name: string;
  description: string;
  duration: string;
  price: number;
  featuresJson: string;
  features?: string[]; // Parsed version
}

@Injectable({
  providedIn: 'root'
})
export class OffreService {
  private apiUrl = 'http://localhost:5280/api/admin/offres';

  constructor(private http: HttpClient) { }

  private mapResponse(res: any): any[] {
    if (res && res.$values) return res.$values;
    return Array.isArray(res) ? res : [];
  }

  // Récupérer toutes les offres (unifié avec Subscriptions)
  getActiveOffres(): Observable<Offre[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => {
        const data = this.mapResponse(res);
        return data.map(offre => ({
          id: offre.id || offre.Id,
          name: offre.name || offre.Name,
          description: offre.description || offre.Description || '',
          duration: offre.duration || offre.Duration || '',
          price: offre.price || offre.Price,
          featuresJson: offre.featuresJson || offre.FeaturesJson || '[]',
          features: this.parseFeatures(offre.featuresJson || offre.FeaturesJson)
        }));
      })
    );
  }

  private parseFeatures(json: string): string[] {
    try {
      return JSON.parse(json || '[]');
    } catch {
      return [];
    }
  }

  // Souscrire à une offre
  subscribeToOffre(offreId: number, memberId: number): Observable<any> {
    return this.http.get(`http://localhost:5280/api/Members/subscribe?memberId=${memberId}&subscriptionId=${offreId}`);
  }
}
