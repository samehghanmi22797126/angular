import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MemberService, Member } from '../../services/member.service';

@Component({
  selector: 'app-members-form',
  templateUrl: './members-form.component.html'
})
export class MembersFormComponent {

  member: Member = {
    name: '',
    email: '',
    age: 0,
    password: '',
    subscriptionId: 0, // ou null si autorisé
    coachId: 0
  };

  constructor(private memberService: MemberService,
    private router: Router) { }

  submit() {
    this.memberService.createMember(this.member).subscribe({
      next: () => {
        this.router.navigate(['/admin/members']);
      },
      error: (err: any) => console.error(err)
    });
  }
}
