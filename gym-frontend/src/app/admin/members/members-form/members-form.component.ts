import { Component } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-members-form',
  templateUrl: './members-form.component.html'
})
export class MembersFormComponent {
  member = { name: '', email: '', age: 0, password: '', subscriptionId: null };

  constructor(private adminService: AdminService, private router: Router) { }

  save() {
    this.adminService.createMember(this.member).subscribe(() => {
      alert('Membre créé');
      this.router.navigate(['/admin/members']);
    });
  }
}
