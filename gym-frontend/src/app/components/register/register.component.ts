import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  user = {
    name: '',
    age: '',
    email: '',
    password: '',
    role: 'member'
  };


  selectedPhoto: File | null = null;
  registrationSuccess = false;
  registeredUser: any = null;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
  }



  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedPhoto = event.target.files[0];
    }
  }

  onSubmit() {
    const formData = new FormData();
    formData.append('name', this.user.name);
    formData.append('email', this.user.email);
    formData.append('password', this.user.password);
    formData.append('role', this.user.role);
    if (this.user.age) {
      formData.append('age', this.user.age.toString());
    }

    if (this.selectedPhoto) {
      formData.append('photo', this.selectedPhoto);
    }
    
    this.authService.register(formData).subscribe({
      next: (res: any) => {
        this.registrationSuccess = true;
        this.registeredUser = { ...this.user };
        


        alert('Inscription réussie ! Vous pouvez maintenant télécharger votre reçu PDF.');
      },
      error: (err) => {
        console.error('Erreur lors de l\'inscription', err);
        alert('Erreur: ' + (err.error?.message || err.error || 'Erreur inconnue'));
      }
    });
  }

  downloadPDF() {
    const doc = new jsPDF();
    
    // Design du PDF
    doc.setFillColor(230, 25, 25); // Rouge Apex
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('APEX PERFORMANCE CENTER', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('REÇU D\'INSCRIPTION OFFICIEL', 105, 30, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 50);
    
    doc.setFontSize(16);
    doc.text('Informations du Membre', 20, 70);
    
    autoTable(doc, {
      startY: 80,
      head: [['Champ', 'Détail']],
      body: [
        ['Nom complet', this.registeredUser.name],
        ['Email', this.registeredUser.email],
        ['Âge', this.registeredUser.age],
        ['Statut', 'En attente de validation']
      ],
      theme: 'striped',
      headStyles: { fillColor: [230, 25, 25] }
    });

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const footerY = (doc as any).lastAutoTable.finalY + 20;
    doc.text('Merci de présenter ce document à l\'accueil pour finaliser votre accès.', 105, footerY, { align: 'center' });
    doc.text('11-13 Rue de l\'Artisanat, El Ghazala, Ariana', 105, footerY + 7, { align: 'center' });

    doc.save(`Inscription_Apex_${this.registeredUser.name}.pdf`);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
