import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecruitmentService {
  private apiUrl = 'http://localhost:5280/api/joboffers';

  constructor(private http: HttpClient) { }

  /**
   * Récupère la liste de toutes les offres d'emploi publiées par la salle de sport.
   * Filtre automatiquement l'enveloppe `$values` de la réponse JSON de l'API.
   * @returns Un Observable contenant le tableau des offres d'emploi.
   */
  getOffers(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => res.$values || res)
    );
  }

  /**
   * Soumet une candidature (CV au format PDF + métadonnées candidat) pour une offre spécifique.
   * Transmet les données multipart via FormData.
   * @param id L'identifiant unique de l'offre d'emploi.
   * @param file Le fichier PDF du CV sélectionné.
   * @param candidateName Le nom complet du candidat.
   * @param candidateEmail L'adresse e-mail du candidat (pour recevoir les réponses).
   * @returns Un Observable confirmant la réception de la candidature.
   */
  apply(id: number, file: File, candidateName: string, candidateEmail: string): Observable<any> {
    const formData = new FormData();
    formData.append('cvFile', file);
    formData.append('candidateName', candidateName);
    formData.append('candidateEmail', candidateEmail);
    return this.http.post(`${this.apiUrl}/apply/${id}`, formData);
  }

  /**
   * Publie une nouvelle offre d'emploi sur la plateforme (action réservée aux administrateurs).
   * @param offer Les données de l'offre d'emploi (titre, description, profil recherché, etc.).
   * @returns Un Observable contenant l'offre d'emploi créée.
   */
  createOffer(offer: any): Observable<any> {
    return this.http.post(this.apiUrl, offer);
  }

  /**
   * Récupère la liste globale de toutes les candidatures soumises (action réservée aux administrateurs).
   * Filtre automatiquement l'enveloppe `$values` du JSON de l'API.
   * @returns Un Observable contenant le tableau complet des candidatures.
   */
  getApplications(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/applications`).pipe(
      map(res => res.$values || res)
    );
  }

  /**
   * Met à jour le statut d'une candidature spécifique (ex: Acceptée, Refusée) (action réservée aux administrateurs).
   * Provoque l'envoi automatique d'un e-mail de notification au candidat par le backend.
   * @param id L'identifiant unique de la candidature.
   * @param status Le nouveau statut à appliquer (ex: 'Approved', 'Rejected').
   * @returns Un Observable confirmant la mise à jour du statut.
   */
  updateApplicationStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/applications/${id}/status?status=${status}`, {});
  }
}


import { map } from 'rxjs/operators';
