import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private baseUrl = 'http://localhost:5280/api/admin';

  constructor(private http: HttpClient) { }

  // Members
  getMembers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/members`);
  }
  createMember(member: any) {
    return this.http.post(`${this.baseUrl}/members`, member);
  }
  updateMember(id: number, member: any) {
    return this.http.put(`${this.baseUrl}/members/${id}`, member);
  }
  deleteMember(id: number) {
    return this.http.delete(`${this.baseUrl}/members/${id}`);
  }

  // Coaches
  getCoaches(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/coaches`);
  }
  createCoach(coach: any) {
    return this.http.post(`${this.baseUrl}/coaches`, coach);
  }
  updateCoach(id: number, coach: any) {
    return this.http.put(`${this.baseUrl}/coaches/${id}`, coach);
  }
  deleteCoach(id: number) {
    return this.http.delete(`${this.baseUrl}/coaches/${id}`);
  }

  // Subscriptions
  getSubscriptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/subscriptions`);
  }
  createSubscription(subscription: any) {
    return this.http.post(`${this.baseUrl}/subscriptions`, subscription);
  }
  updateSubscription(id: number, subscription: any) {
    return this.http.put(`${this.baseUrl}/subscriptions/${id}`, subscription);
  }
  deleteSubscription(id: number) {
    return this.http.delete(`${this.baseUrl}/subscriptions/${id}`);
  }
}
