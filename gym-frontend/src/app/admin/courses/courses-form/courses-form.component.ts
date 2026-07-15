import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-courses-form',
  templateUrl: './courses-form.component.html',
  styleUrls: ['./courses-form.component.css']
})
export class CoursesFormComponent implements OnInit {
  isEdit = false;
  courseId: number | null = null;
  loading = false;
  coaches: any[] = [];
  
  course: any = {
    title: '',
    description: '',
    startAt: '',
    durationMinutes: 60,
    maxParticipants: 10,
    coachId: null
  };

  constructor(
    private adminService: AdminService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Charger les coachs pour le select
    this.adminService.getCoaches().subscribe(data => this.coaches = data);

    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.courseId = +params['id'];
        this.isEdit = true;
        this.loadCourse(this.courseId);
      }
    });
  }

  loadCourse(id: number) {
    this.loading = true;
    this.adminService.getCourses().subscribe(courses => {
      const found = courses.find(c => c.id === id);
      if (found) {
        // Formater la date pour l'input datetime-local
        let dateStr = '';
        if (found.startAt) {
          const date = new Date(found.startAt);
          dateStr = date.toISOString().slice(0, 16);
        }
        this.course = { ...found, startAt: dateStr };
        this.loading = false;
      }
    });
  }

  onSubmit() {
    this.loading = true;
    
    // Ensure the date is sent in a format .NET can parse easily
    let finalStartAt = null;
    try {
      if (this.course.startAt) {
        const d = new Date(this.course.startAt);
        if (!isNaN(d.getTime())) {
          finalStartAt = d.toISOString();
        }
      }
    } catch (e) {
      console.error('Invalid date format', e);
      // Fallback: don't crash the whole submisson
    }

    const payload = { 
      ...this.course,
      startAt: finalStartAt
    };
    
    if (this.isEdit && this.courseId) {
      this.adminService.updateCourse(this.courseId, payload).subscribe({
        next: () => this.router.navigate(['/admin/courses']),
        error: (err) => { console.error(err); this.loading = false; }
      });
    } else {
      this.adminService.createCourse(payload).subscribe({
        next: () => this.router.navigate(['/admin/courses']),
        error: (err) => { console.error(err); this.loading = false; }
      });
    }
  }
}
