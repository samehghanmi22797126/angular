import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface LoginPayload {
  email: string;
  password: string
}

export interface LoginResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  photoUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5280/api/Auth';
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  /**
   * Constructeur du service d'authentification.
   * Restaure la session de l'utilisateur actif s'il existe une entrée dans le stockage local (localStorage).
   * @param http Le client HTTP d'Angular pour effectuer les requêtes réseau.
   */
  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  /**
   * Authentifie un utilisateur (Admin, Coach ou Membre) via ses identifiants.
   * Normalise le rôle retourné par le serveur en minuscules pour assurer une cohérence interne,
   * puis sauvegarde l'utilisateur dans localStorage et met à jour l'état réactif (BehaviorSubject).
   * @param payload Objet contenant l'email et le mot de passe de l'utilisateur.
   * @returns Un Observable contenant les informations de l'utilisateur connecté.
   */
  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, payload)
      .pipe(
        tap(response => {
          console.log('Réponse API brute:', response);

          if (response.id) {
            // Normaliser le rôle en minuscule
            let normalizedRole = 'member';
            if (response.role) {
              normalizedRole = response.role.toLowerCase();
            }

            const normalizedResponse = {
              ...response,
              role: normalizedRole
            };

            console.log('Rôle normalisé:', normalizedResponse.role);
            localStorage.setItem('currentUser', JSON.stringify(normalizedResponse));
            this.currentUserSubject.next(normalizedResponse);
          }
        })
      );
  }

  /**
   * Demande au serveur d'envoyer un lien de réinitialisation de mot de passe à l'email spécifié.
   * @param email L'adresse e-mail de l'utilisateur ayant oublié son mot de passe.
   * @returns Un Observable contenant le message de confirmation du serveur.
   */
  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, { email });
  }

  /**
   * Enregistre un nouvel utilisateur (Admin, Coach ou Membre) sur la plateforme.
   * En cas de succès d'un membre/admin direct, connecte automatiquement l'utilisateur en mettant à jour
   * le localStorage et le BehaviorSubject. Si c'est un coach nécessitant une approbation, ne connecte pas.
   * @param payload Les données du formulaire d'inscription (nom, email, mot de passe, rôle, spécialité, photo, etc.).
   * @returns Un Observable avec les informations de l'utilisateur créé ou l'indication d'attente d'approbation.
   */
  register(payload: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, payload)
      .pipe(
        tap(response => {
          // Si requiresApproval est présent, on ne connecte pas l'utilisateur
          if (response && (response as any).requiresApproval) {
             console.log('Inscription réussie - En attente d\'approbation administrateur');
             return;
          }

          if (response.id) {
            let normalizedRole = 'member';
            if (response.role) {
              normalizedRole = response.role.toLowerCase();
            }
            const normalizedResponse = { ...response, role: normalizedRole };
            localStorage.setItem('currentUser', JSON.stringify(normalizedResponse));
            this.currentUserSubject.next(normalizedResponse);
          }
        })
      );
  }

  /**
   * Déconnecte l'utilisateur actuel en supprimant sa session du localStorage
   * et en réinitialisant le flux de l'utilisateur à null.
   */
  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  /**
   * Vérifie de manière synchrone si un utilisateur est actuellement authentifié.
   * @returns Vrai si un utilisateur est connecté, Faux sinon.
   */
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * Récupère de manière synchrone les données de l'utilisateur actuellement connecté.
   * @returns Les informations de l'utilisateur connecté ou null s'il n'y a pas de session active.
   */
  getCurrentUser(): LoginResponse | null {
    return this.currentUserSubject.value;
  }
}
