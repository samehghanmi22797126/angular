import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Coach {
  id: number;
  name: string;
  specialty: string;
  email: string;
  photoUrl?: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  startAt: Date;
  durationMinutes: number;
  maxParticipants: number;
  coachId: number;
  members?: any;
}

export interface Member {
  id?: number;  // Rendre id optionnel (ajouter ?)
  name: string;
  email: string;
  age: number;
  password?: string;
  coachId?: number;
  photoUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CoachService {
  private apiUrl = 'http://localhost:5280/api';

  constructor(private http: HttpClient) { }

  private mapResponse(res: any): any[] {
    if (!res) return [];
    if (res.$values) return res.$values;
    if (Array.isArray(res)) return res;
    if (res.data && Array.isArray(res.data)) return res.data;
    if (res.results && Array.isArray(res.results)) return res.results;
    return [];
  }

  getCoach(id: number): Observable<Coach> {
    return this.http.get<Coach>(`${this.apiUrl}/Coach/${id}`);
  }

  getCoachCourses(coachId: number): Observable<Course[]> {
    return this.http.get<any>(`${this.apiUrl}/Coach/${coachId}/courses`)
      .pipe(map(res => this.mapResponse(res)));
  }

  getCoachMembers(coachId: number): Observable<Member[]> {
    return this.http.get<any>(`${this.apiUrl}/Coach/${coachId}/members`)
      .pipe(map(res => this.mapResponse(res)));
  }

  // --- NOUVEAU SYSTÈME DE MEMBRES ---

  getAllMembers(): Observable<Member[]> {
    return this.http.get<any>(`${this.apiUrl}/Members`)
      .pipe(map(res => this.mapResponse(res)));
  }

  assignMemberToCoach(coachId: number, memberId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/Coach/${coachId}/add-member/${memberId}`, {});
  }

  removeMemberFromCoach(coachId: number, memberId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/Coach/${coachId}/remove-member/${memberId}`, {});
  }

  // Supprimer un membre
  deleteMember(memberId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Members/${memberId}`);
  }

  // Modifier un membre
  updateMember(id: number, member: Member): Observable<any> {
    return this.http.put(`${this.apiUrl}/Members/${id}`, member);
  }

  // Créer un cours
  createCourse(course: any): Observable<Course> {
    return this.http.post<Course>(`${this.apiUrl}/Courses`, course);
  }

  // Supprimer un cours
  deleteCourse(courseId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Courses/${courseId}`);
  }

  updateCourse(id: number, course: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/Courses/${id}`, course);
  }
}
