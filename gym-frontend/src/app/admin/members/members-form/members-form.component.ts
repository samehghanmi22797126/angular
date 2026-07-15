import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-members-form',
  templateUrl: './members-form.component.html',
  styleUrls: ['./members-form.component.css']
})
export class MembersFormComponent implements OnInit {
  isEdit = false;
  memberId: number | null = null;
  loading = false;
  subscriptions: any[] = [];
  
  member: any = {
    name: '',
    email: '',
    age: '',
    password: '',
    subscriptionId: null
  };

  constructor(
    private adminService: AdminService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Charger les abonnements pour le select
    this.adminService.getSubscriptions().subscribe(data => this.subscriptions = data);

    // Vérifier si on est en mode édition
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.memberId = +params['id'];
        this.isEdit = true;
        this.loadMember(this.memberId);
      }
    });
  }

  loadMember(id: number) {
    this.loading = true;
    this.adminService.getMembers().subscribe(members => {
      const found = members.find(m => m.id === id);
      if (found) {
        this.member = { ...found };
        this.loading = false;
      }
    });
  }

  onSubmit() {
    this.loading = true;
    if (this.isEdit && this.memberId) {
      this.adminService.updateMember(this.memberId, this.member).subscribe({
        next: () => this.router.navigate(['/admin/members']),
        error: (err) => { console.error(err); this.loading = false; }
      });
    } else {
      this.adminService.createMember(this.member).subscribe({
        next: () => this.router.navigate(['/admin/members']),
        error: (err) => { console.error(err); this.loading = false; }
      });
    }
  }
}
