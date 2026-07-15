import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Offre {
  id: number;
  name: string;
  description: string;
  durationInMonths: number;
  price: number;
  type: string;
  features: string[];
  isActive: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class OffreService {
  private apiUrl = 'http://localhost:5280/api';

  constructor(private http: HttpClient) { }

  getAllOffres(): Observable<Offre[]> {
    return this.http.get<Offre[]>(`${this.apiUrl}/Subscriptions`);
  }

  getActiveOffres(): Observable<Offre[]> {
    return this.http.get<Offre[]>(`${this.apiUrl}/Subscriptions/active`);
  }

  getOffreById(id: number): Observable<Offre> {
    return this.http.get<Offre>(`${this.apiUrl}/Subscriptions/${id}`);
  }

  createOffre(offre: Offre): Observable<Offre> {
    return this.http.post<Offre>(`${this.apiUrl}/Subscriptions`, offre);
  }

  updateOffre(id: number, offre: Offre): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/Subscriptions/${id}`, offre);
  }

  deleteOffre(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Subscriptions/${id}`);
  }

  subscribeToOffre(offreId: number, memberId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/Subscriptions/subscribe`, { offreId, memberId });
  }
}
