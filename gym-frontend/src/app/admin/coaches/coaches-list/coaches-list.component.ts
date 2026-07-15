import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-coaches-list',
  templateUrl: './coaches-list.component.html',
  styleUrls: ['./coaches-list.component.css']
})
export class CoachesListComponent implements OnInit {
  coaches: any[] = [];
  loading: boolean = true;

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadCoaches();
  }

  loadCoaches() {
    this.loading = true;
    this.adminService.getCoaches().subscribe({
      next: (data: any[]) => {
        this.coaches = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement coachs:', err);
        this.loading = false;
      }
    });
  }

  deleteCoach(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce coach ?')) {
      this.adminService.deleteCoach(id).subscribe({
        next: () => this.loadCoaches(),
        error: (err: any) => alert('Erreur lors de la suppression')
      });
    }
  }

  approveCoach(id: number) {
    this.adminService.approveCoach(id).subscribe({
      next: () => this.loadCoaches(),
      error: (err: any) => alert('Erreur lors de l\'approbation')
    });
  }
}
