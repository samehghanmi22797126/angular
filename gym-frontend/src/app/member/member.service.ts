import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Définition des interfaces
export interface Member {
  id: number;
  name: string;
  age: number;
  email: string;
  subscriptionId?: number;
  coachId?: number;
  subscription?: Subscription;
  coach?: Coach;
  courses?: Course[];
  photoUrl?: string;
}

export interface Subscription {
  id: number;
  name: string;
  durationInMonths: number;
  price: number;
  memberId: number;
  type: string;
  member?: Member;
}

export interface Coach {
  id: number;
  name: string;
  specialty: string;
  email: string;
  members?: Member[];
  courses?: Course[];
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
  coach?: Coach;
  members?: Member[];
}

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private apiUrl = 'http://localhost:5280/api';

  constructor(private http: HttpClient) { }

  getMember(id: number): Observable<Member> {
    return this.http.get<Member>(`${this.apiUrl}/Members/${id}`);
  }

  getMemberSubscription(memberId: number): Observable<Subscription> {
    return this.http.get<Subscription>(`${this.apiUrl}/Members/${memberId}/subscription`);
  }

  getMemberCourses(memberId: number): Observable<Course[]> {
    return this.http.get<any>(`${this.apiUrl}/Members/${memberId}/courses`).pipe(
      map(res => {
        if (!res) return [];
        if (res.$values) return res.$values;
        if (Array.isArray(res)) return res;
        return [];
      })
    );
  }

  // Récupérer TOUS les cours disponibles dans la salle
  getAllCourses(): Observable<Course[]> {
    return this.http.get<any>(`${this.apiUrl}/Courses`).pipe(
      map(res => {
        if (!res) return [];
        if (res.$values) return res.$values;
        if (Array.isArray(res)) return res;
        return [];
      })
    );
  }

  // Inscrire un membre à un cours
  registerMemberToCourse(courseId: number, memberId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/Courses/${courseId}/register/${memberId}`, {});
  }

  // Charger tous les plans d'abonnements disponibles
  getAllSubscriptions(): Observable<Subscription[]> {
    return this.http.get<any>(`${this.apiUrl}/Subscriptions`).pipe(
      map(res => {
        if (!res) return [];
        if (res.$values) return res.$values;
        if (Array.isArray(res)) return res;
        return [];
      })
    );
  }

  // Assigner un abonnement à un membre (met à jour le subscriptionId du membre)
  subscribeMember(memberId: number, subscriptionId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/Members/subscribe?memberId=${memberId}&subscriptionId=${subscriptionId}`);
  }
}
