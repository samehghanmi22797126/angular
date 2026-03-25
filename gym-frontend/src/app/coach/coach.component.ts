import { Component, OnInit } from '@angular/core';
import { CoachService } from './coach.service';

@Component({
  selector: 'app-coach',
  templateUrl: './coach.component.html'
})
export class CoachComponent implements OnInit {

  coachId = 1; // temporaire

  members: any[] = [];
  courses: any[] = [];

  currentMember: any = { name: '', email: '' };
  currentCourse: any = { name: '' };

  isEditMember = false;
  isEditCourse = false;

  constructor(private coachService: CoachService) { }

  ngOnInit(): void {
    this.loadMembers();
    this.loadCourses();
  }

  // ================= MEMBERS =================

  loadMembers() {
    this.coachService.getMembersByCoach(this.coachId).subscribe(data => this.members = data as any[]);
  }

  saveMember() {
    this.currentMember.coachId = this.coachId;

    if (this.isEditMember) {
      this.coachService.updateMember(this.currentMember).subscribe(() => {
        this.loadMembers();
        this.resetMember();
      });
    } else {
      this.coachService.createMember(this.currentMember).subscribe(() => {
        this.loadMembers();
        this.resetMember();
      });
    }
  }

  editMember(m: any) {
    this.currentMember = { ...m };
    this.isEditMember = true;
  }

  deleteMember(id: number) {
    this.coachService.deleteMember(id).subscribe(() => this.loadMembers());
  }

  resetMember() {
    this.currentMember = { name: '', email: '' };
    this.isEditMember = false;
  }

  // ================= COURSES =================

  loadCourses() {
    this.coachService.getCoursesByCoach(this.coachId).subscribe(data => this.courses = data as any[]);
  }

  saveCourse() {
    this.currentCourse.coachId = this.coachId;

    if (this.isEditCourse) {
      this.coachService.updateCourse(this.currentCourse).subscribe(() => {
        this.loadCourses();
        this.resetCourse();
      });
    } else {
      this.coachService.createCourse(this.currentCourse).subscribe(() => {
        this.loadCourses();
        this.resetCourse();
      });
    }
  }

  editCourse(c: any) {
    this.currentCourse = { ...c };
    this.isEditCourse = true;
  }

  deleteCourse(id: number) {
    this.coachService.deleteCourse(id).subscribe(() => this.loadCourses());
  }

  resetCourse() {
    this.currentCourse = { name: '' };
    this.isEditCourse = false;
  }
}
