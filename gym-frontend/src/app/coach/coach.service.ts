// src/app/coach/coach.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Member {
  id?: number;
  name: string;
  age: number;
  email: string;
  password: string;
  coachId: number;
  subscriptionId: number;
}

export interface Course {
  id?: number;
  title: string;
  description: string;
  startAt: string;
  durationMinutes: number;
  coachId: number;
}

@Injectable({
  providedIn: 'root'
})
export class CoachService {
  private apiUrl = 'http://localhost:5280/api'; // URL de ton API

  constructor(private http: HttpClient) { }

  // Membres
  getMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(`${this.apiUrl}/Members`);
  }

  addMember(member: Member): Observable<Member> {
    return this.http.post<Member>(`${this.apiUrl}/Members`, member);
  }

  // Cours
  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/Courses`);
  }

  addCourse(course: Course): Observable<Course> {
    return this.http.post<Course>(`${this.apiUrl}/Courses`, course);
  }
}
