import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private apiUrl = 'http://localhost:5280/api/videos';

  constructor(private http: HttpClient) { }

  /**
   * Récupère la liste de toutes les vidéos disponibles sur le serveur.
   * @returns Un Observable contenant le tableau des vidéos ordonnées par date de mise en ligne décroissante.
   */
  getVideos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  /**
   * Envoie une nouvelle vidéo au serveur avec son titre et le nom de l'auteur.
   * Utilise FormData pour gérer l'envoi multipart (binaire + métadonnées).
   * @param file Le fichier vidéo sélectionné par l'utilisateur.
   * @param title Le titre donné à la vidéo.
   * @param uploadedBy Le nom de l'utilisateur (admin ou coach) qui met en ligne la vidéo.
   * @returns Un Observable représentant le résultat de la requête de création.
   */
  uploadVideo(file: File, title: string, uploadedBy: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('uploadedBy', uploadedBy);

    return this.http.post<any>(`${this.apiUrl}/upload`, formData);
  }

  /**
   * Supprime une vidéo spécifique du serveur (fichier physique + enregistrement DB) via son ID.
   * @param id L'identifiant unique de la vidéo à supprimer.
   * @returns Un Observable confirmant le succès de la suppression.
   */
  deleteVideo(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
