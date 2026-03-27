import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Member {
  id?: number;
  name: string;
  email: string;
  age: number;
  password: string;
  subscriptionId: number;
  coachId: number;
}

@Injectable({
  providedIn: 'root'
})
export class MemberService {

  private apiUrl = 'http://localhost:5280/api/Members';

  constructor(private http: HttpClient) { }

  getMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(this.apiUrl);
  }

  createMember(member: Member): Observable<Member> {
    return this.http.post<Member>(this.apiUrl, member);
  }
}
