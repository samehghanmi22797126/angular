// src/app/admin/coaches/coaches-list/coaches-list.component.ts
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-coaches-list',
  templateUrl: './coaches-list.component.html',
  styleUrls: ['./coaches-list.component.css']
})
export class CoachesListComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    // Ici tu pourras récupérer les coaches depuis le service plus tard
  }

}
