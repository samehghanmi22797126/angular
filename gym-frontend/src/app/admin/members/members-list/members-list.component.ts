import { Component, OnInit } from '@angular/core';
import { MemberService, Member } from '../../services/member.service';

@Component({
  selector: 'app-members-list',
  templateUrl: './members-list.component.html'
})
export class MembersListComponent implements OnInit {

  members: Member[] = [];

  constructor(private memberService: MemberService) { }

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers() {
    this.memberService.getMembers().subscribe({
      next: (data: Member[]) => this.members = data,
      error: (err: any) => console.error(err)
    });
  }
}
