import { Component, OnInit } from '@angular/core';
import { MemberService, Member, Subscription, Course } from './member.service';

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.css']
})
export class MemberComponent implements OnInit {
  memberId: number = 1; 
  member?: Member;
  subscription?: Subscription;
  courses: Course[] = [];

  constructor(private memberService: MemberService) { }

  ngOnInit(): void {
    this.loadMemberData();
  }

  loadMemberData(): void {
    this.memberService.getMember(this.memberId).subscribe({
      next: (data) => this.member = data,
      error: (err) => console.error('Erreur member', err)
    });

    this.memberService.getSubscription(this.memberId).subscribe({
      next: (data) => this.subscription = data,
      error: (err) => console.error('Erreur subscription', err)
    });

    this.memberService.getCourses(this.memberId).subscribe({
      next: (data) => this.courses = data,
      error: (err) => console.error('Erreur courses', err)
    });
  }
}
