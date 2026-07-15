import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private baseUrl = 'http://localhost:5280/api/admin';

  constructor(private http: HttpClient) { }

  private mapResponse(res: any): any[] {
    console.log('API Response:', res);
    if (!res) return [];
    
    // Handle ASP.NET ReferenceHandler.Preserve format ($values)
    if (res.$values) {
      console.log('Mapping from $values:', res.$values);
      return res.$values;
    }
    
    // Handle direct arrays
    if (Array.isArray(res)) {
      return res;
    }
    
    // Handle nested object with results
    if (res.data && Array.isArray(res.data)) return res.data;
    if (res.results && Array.isArray(res.results)) return res.results;

    console.warn('Unexpected response format:', res);
    return [];
  }

  // Members
  getMembers(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/members`).pipe(map(res => this.mapResponse(res)));
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
  approveMember(id: number) {
    return this.http.put(`${this.baseUrl}/members/${id}/approve`, {});
  }

  // Coaches
  getCoaches(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/coaches`).pipe(map(res => this.mapResponse(res)));
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
  approveCoach(id: number) {
    return this.http.put(`${this.baseUrl}/coaches/${id}/approve`, {});
  }

  // Subscriptions
  getSubscriptions(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/subscriptions`).pipe(map(res => this.mapResponse(res)));
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

  // Courses
  getCourses(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/courses`).pipe(map(res => this.mapResponse(res)));
  }
  createCourse(course: any) {
    return this.http.post(`${this.baseUrl}/courses`, course);
  }
  updateCourse(id: number, course: any) {
    return this.http.put(`${this.baseUrl}/courses/${id}`, course);
  }
  deleteCourse(id: number) {
    return this.http.delete(`${this.baseUrl}/courses/${id}`);
  }

  // Admin Profile
  getAdminProfile(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/profile/${id}`);
  }
  updateAdminProfile(id: number, admin: any) {
    return this.http.put(`${this.baseUrl}/profile/${id}`, admin);
  }

  // Offres
  getOffres(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/offres`).pipe(map(res => this.mapResponse(res)));
  }
  createOffre(offre: any) {
    return this.http.post(`${this.baseUrl}/offres`, offre);
  }
  updateOffre(id: number, offre: any) {
    return this.http.put(`${this.baseUrl}/offres/${id}`, offre);
  }
  deleteOffre(id: number) {
    return this.http.delete(`${this.baseUrl}/offres/${id}`);
  }
}
