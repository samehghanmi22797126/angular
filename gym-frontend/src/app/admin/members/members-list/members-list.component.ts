import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-members-list',
  templateUrl: './members-list.component.html',
  styleUrls: ['./members-list.component.css']
})
export class MembersListComponent implements OnInit {
  members: any[] = [];
  loading: boolean = true;

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers() {
    this.loading = true;
    this.adminService.getMembers().subscribe({
      next: (data: any[]) => {
        this.members = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement membres:', err);
        this.loading = false;
      }
    });
  }

  deleteMember(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
      this.adminService.deleteMember(id).subscribe({
        next: () => this.loadMembers(),
        error: (err: any) => alert('Erreur lors de la suppression')
      });
    }
  }

  approveMember(id: number) {
    this.adminService.approveMember(id).subscribe({
      next: () => this.loadMembers(),
      error: (err: any) => alert('Erreur lors de l\'approbation')
    });
  }
}
