import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-coaches-form',
  templateUrl: './coaches-form.component.html',
  styleUrls: ['./coaches-form.component.css']
})
export class CoachesFormComponent implements OnInit {
  coach = { name: '', specialty: '', email: '', password: '' };

  constructor() { }

  ngOnInit(): void { }

  onSubmit() {
    console.log('Coach submitted:', this.coach);
    alert('Coach ajouté avec succès !');
  }
}
