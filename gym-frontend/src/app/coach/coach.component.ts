// src/app/coach/coach.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CoachService, Member, Course } from './coach.service';

@Component({
  selector: 'app-coach',
  templateUrl: './coach.component.html',
  styleUrls: ['./coach.component.css']
})
export class CoachComponent implements OnInit {

  memberForm!: FormGroup;
  courseForm!: FormGroup;

  members: Member[] = [];
  courses: Course[] = [];

  constructor(private fb: FormBuilder, private coachService: CoachService) { }

  ngOnInit(): void {
    
    this.memberForm = this.fb.group({
      name: ['', Validators.required],
      age: [0, Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      coachId: [1, Validators.required],
      subscriptionId: [1, Validators.required]
    });

    this.courseForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      startAt: ['', Validators.required],
      durationMinutes: [0, Validators.required],
      coachId: [1, Validators.required]
    });

   
    this.loadMembers();
    this.loadCourses();
  }

  loadMembers() {
    this.coachService.getMembers().subscribe((data: Member[]) => {
      this.members = data;
    });
  }

  loadCourses() {
    this.coachService.getCourses().subscribe((data: Course[]) => {
      this.courses = data;
    });
  }

  addMember() {
    if (this.memberForm.valid) {
      this.coachService.addMember(this.memberForm.value).subscribe(() => {
        this.memberForm.reset({ coachId: 1, subscriptionId: 1 });
        this.loadMembers(); 
      });
    }
  }

  addCourse() {
    if (this.courseForm.valid) {
      this.coachService.addCourse(this.courseForm.value).subscribe(() => {
        this.courseForm.reset({ coachId: 1 });
        this.loadCourses(); 
      });
    }
  }
}
