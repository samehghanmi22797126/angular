import { Component, OnInit } from '@angular/core';
import { RecruitmentService } from '../../services/recruitment.service';

@Component({
  selector: 'app-recruitment',
  templateUrl: './recruitment.component.html',
  styleUrls: ['./recruitment.component.css']
})
export class RecruitmentComponent implements OnInit {
  offers: any[] = [];
  applications: any[] = [];
  
  newOffer = {
    title: '',
    description: ''
  };

  showForm = false;

  constructor(private recruitmentService: RecruitmentService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.recruitmentService.getOffers().subscribe(data => this.offers = data);
    this.recruitmentService.getApplications().subscribe(data => this.applications = data);
  }

  submitOffer() {
    this.recruitmentService.createOffer(this.newOffer).subscribe({
      next: () => {
        this.newOffer = { title: '', description: '' };
        this.showForm = false;
        this.loadData();
        alert('Offre créée avec succès !');
      }
    });
  }

  getDownloadUrl(cvPath: string) {
    return `http://localhost:5280/uploads/cvs/${cvPath}`;
  }

  updateStatus(id: number, status: string) {
    this.recruitmentService.updateApplicationStatus(id, status).subscribe({
      next: () => {
        this.loadData();
        alert(`Candidature marquée comme : ${status}`);
      },
      error: (err) => alert('Erreur lors du changement de statut.')
    });
  }
}

