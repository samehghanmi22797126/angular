import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-courses-list',
  templateUrl: './courses-list.component.html',
  styleUrls: ['./courses-list.component.css']
})
export class CoursesListComponent implements OnInit {
  courses: any[] = [];
  loading: boolean = true;

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses() {
    this.loading = true;
    this.adminService.getCourses().subscribe({
      next: (data: any[]) => {
        this.courses = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement cours:', err);
        this.loading = false;
      }
    });
  }

  deleteCourse(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      this.adminService.deleteCourse(id).subscribe({
        next: () => this.loadCourses(),
        error: (err: any) => alert('Erreur lors de la suppression')
      });
    }
  }

  formatDate(date: any): string {
    if (!date) return 'Non défini';
    return new Date(date).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
