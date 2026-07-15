import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';

export interface User {
  id?: number;
  email: string;
  name?: string;
  role?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private usersSubject = new BehaviorSubject<User[]>([]);
  users$ = this.usersSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Récupère la liste globale de tous les utilisateurs inscrits sur la plateforme
   * et met à jour le BehaviorSubject de manière réactive.
   * @returns Un Observable contenant le tableau complet des utilisateurs.
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users')
      .pipe(tap(users => this.usersSubject.next(users)));
  }

  /**
   * Enregistre un nouvel utilisateur au niveau du serveur backend.
   * Analyse la réponse HTTP complète afin de gérer dynamiquement les différents comportements serveur (body 200/201 vs status vide 204).
   * En cas de succès, met à jour le BehaviorSubject local réactif ou déclenche un rechargement.
   * @param user Un objet partiel représentant l'utilisateur à créer.
   * @returns Un Observable contenant l'utilisateur créé, ou null si le corps de réponse est vide.
   */
  addUser(user: Partial<User>): Observable<User | null> {
    // Demande en mode full response pour inspecter le status et le body
    return this.http.post<User>('/api/users', user, { observe: 'response' })
      .pipe(
        tap((resp: HttpResponse<User>) => {
          const created = resp.body;
          if (created && created.id) {
            // Ajouter localement l'utilisateur créé en tête de liste
            const current = this.usersSubject.value || [];
            this.usersSubject.next([created, ...current]);
          } else if (resp.status === 201 || resp.status === 204) {
            // Pas de body retourné : recharger la liste depuis le serveur
            this.getUsers().subscribe({ error: () => {} });
          }
        }),
        map(resp => resp.body ?? null)
      );
  }

  /**
   * Force un rafraîchissement asynchrone manuel de la liste des utilisateurs auprès de l'API.
   */
  refresh(): void {
    this.getUsers().subscribe({ error: () => {} });
  }
}
