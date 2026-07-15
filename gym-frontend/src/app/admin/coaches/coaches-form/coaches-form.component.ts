import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-coaches-form',
  templateUrl: './coaches-form.component.html',
  styleUrls: ['./coaches-form.component.css']
})
export class CoachesFormComponent implements OnInit {
  isEdit = false;
  coachId: number | null = null;
  loading = false;
  
  coach: any = {
    name: '',
    email: '',
    specialty: '',
    password: ''
  };

  constructor(
    private adminService: AdminService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.coachId = +params['id'];
        this.isEdit = true;
        this.loadCoach(this.coachId);
      }
    });
  }

  loadCoach(id: number) {
    this.loading = true;
    this.adminService.getCoaches().subscribe(coaches => {
      const found = coaches.find(c => c.id === id);
      if (found) {
        this.coach = { ...found };
        this.loading = false;
      }
    });
  }

  onSubmit() {
    this.loading = true;
    if (this.isEdit && this.coachId) {
      this.adminService.updateCoach(this.coachId, this.coach).subscribe({
        next: () => this.router.navigate(['/admin/coaches']),
        error: (err) => { console.error(err); this.loading = false; }
      });
    } else {
      this.adminService.createCoach(this.coach).subscribe({
        next: () => this.router.navigate(['/admin/coaches']),
        error: (err) => { console.error(err); this.loading = false; }
      });
    }
  }
}
