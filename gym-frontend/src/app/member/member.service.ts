import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Member {
  id: number;
  name: string;
  age: number;
  email: string;
  subscriptionId: number;
  subscription?: Subscription;
  courses?: Course[];
}

export interface Subscription {
  id: number;
  name: string;
  price: number;
}

export interface Course {
  id: number;
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private baseUrl = 'https://localhost:5280/api/members'; 

  constructor(private http: HttpClient) { }

  getMember(memberId: number): Observable<Member> {
    return this.http.get<Member>(`${this.baseUrl}/${memberId}`);
  }

  getSubscription(memberId: number): Observable<Subscription> {
    return this.http.get<Subscription>(`${this.baseUrl}/${memberId}/subscription`);
  }

  getCourses(memberId: number): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.baseUrl}/${memberId}/courses`);
  }
}
