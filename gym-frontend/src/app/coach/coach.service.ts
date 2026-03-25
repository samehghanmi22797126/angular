import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CoachService {

  private apiUrlMembers = 'http://localhost:5280/api/members';
  private apiUrlCourses = 'http://localhost:5280/api/courses';

  constructor(private http: HttpClient) { }

  // ================= MEMBERS =================

  createMember(member: any): Observable<any> {
    return this.http.post(this.apiUrlMembers, member);
  }

  updateMember(member: any): Observable<any> {
    return this.http.put(`${this.apiUrlMembers}/${member.id}`, member);
  }

  deleteMember(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrlMembers}/${id}`);
  }

  getMembersByCoach(id: number): Observable<any> {
    return this.http.get(`${this.apiUrlMembers}/byCoach/${id}`);
  }

  // ================= COURSES =================

  createCourse(course: any): Observable<any> {
    return this.http.post(this.apiUrlCourses, course);
  }

  updateCourse(course: any): Observable<any> {
    return this.http.put(`${this.apiUrlCourses}/${course.id}`, course);
  }

  deleteCourse(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrlCourses}/${id}`);
  }

  getCoursesByCoach(id: number): Observable<any> {
    return this.http.get(`${this.apiUrlCourses}/byCoach/${id}`);
  }
}
