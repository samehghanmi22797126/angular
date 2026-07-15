import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { CoachService, Course, Member } from './coach.service';

@Component({
  selector: 'app-coach',
  templateUrl: './coach.component.html',
  styleUrls: ['./coach.component.css']
})
export class CoachComponent implements OnInit {
  coach: any = null;
  courses: Course[] = [];
  members: Member[] = [];
  allMembers: Member[] = [];
  availableMembers: Member[] = [];
  loading: boolean = true;
  errorMessage: string = '';
  successMessage: string = '';
  memberForm: FormGroup;
  courseForm: FormGroup;
  editingCourseId: number | null = null;
  editingMemberId: number | null = null;

  constructor(
    private authService: AuthService,
    private coachService: CoachService,
    private router: Router,
    private fb: FormBuilder
  ) {
    // Formulaire de modification de membre
    this.memberForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      age: ['', [Validators.required, Validators.min(16), Validators.max(100)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Formulaire cours
    this.courseForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required]], // minLength(10) supprimé car trop strict
      startAt: ['', Validators.required],
      durationMinutes: ['', [Validators.required, Validators.min(10)]],
      maxParticipants: [10, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.role === 'coach') {
      this.coach = user;
      this.loadCoachData(user.id);
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadCoachData(coachId: number): void {
    // Charger les cours du coach
    this.coachService.getCoachCourses(coachId).subscribe({
      next: (courses: Course[]) => {
        this.courses = courses;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur chargement cours:', error);
        this.loading = false;
      }
    });

    // Charger les membres du coach
    this.coachService.getCoachMembers(coachId).subscribe({
      next: (members: Member[]) => {
        this.members = members;
      },
      error: (error: any) => {
        console.error('Erreur chargement membres:', error);
      }
    });

    // Charger tous les membres de la salle
    this.coachService.getAllMembers().subscribe({
      next: (members: Member[]) => {
        this.allMembers = members;
        this.filterAvailableMembers();
      },
      error: (error: any) => {
        console.error('Erreur chargement tous les membres:', error);
      }
    });
  }

  filterAvailableMembers(): void {
    if (!this.coach) return;
    // Les membres disponibles sont ceux qui ne sont pas déjà dans l'équipe de ce coach
    this.availableMembers = this.allMembers.filter(m => m.coachId !== this.coach.id);
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  getRemainingSpots(course: any): number {
    const max = course.maxParticipants || course.MaxParticipants || 10;
    const enrolled = course.members?.$values ? course.members.$values.length : (course.members?.length || 0);
    return Math.max(0, this.getMaxParticipants(course) - enrolled);
  }

  getMaxParticipants(course: any): number {
    return course.maxParticipants || course.MaxParticipants || 10;
  }

  // --- ACTIONS SUR LES MEMBRES ---
  
  assignMember(memberId: number | undefined): void {
    if (!memberId) return;
    this.coachService.assignMemberToCoach(this.coach.id, memberId).subscribe({
      next: () => {
        this.successMessage = 'Membre assigné à votre équipe avec succès.';
        // Transfert visuel
        const member = this.allMembers.find(m => m.id === memberId);
        if (member) {
          member.coachId = this.coach.id;
          if (!this.members.some(m => m.id === memberId)) {
            this.members.push(member);
          }
        }
        this.filterAvailableMembers();
        setTimeout(() => { this.successMessage = ''; }, 3000);
      },
      error: (error: any) => {
        console.error('Erreur:', error);
        this.errorMessage = 'Erreur lors de l\'assignation du membre.';
      }
    });
  }

  removeMemberFromTeam(memberId: number | undefined): void {
    if (!memberId) return;
    if (confirm('Voulez-vous retirer ce membre de votre équipe ?')) {
      this.coachService.removeMemberFromCoach(this.coach.id, memberId).subscribe({
        next: () => {
          this.successMessage = 'Membre retiré de votre équipe.';
          this.members = this.members.filter(m => m.id !== memberId);
          
          const member = this.allMembers.find(m => m.id === memberId);
          if (member) {
            member.coachId = undefined; // Il retourne dans la liste des disponibles
          }
          this.filterAvailableMembers();
          setTimeout(() => { this.successMessage = ''; }, 3000);
        },
        error: (error: any) => {
          console.error('Erreur:', error);
          this.errorMessage = 'Erreur lors du retrait du membre.';
        }
      });
    }
  }

  editMember(member: Member): void {
    this.editingMemberId = member.id!;
    this.memberForm.patchValue({
      name: member.name,
      email: member.email,
      age: member.age,
      password: member.password || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEditMember(): void {
    this.editingMemberId = null;
    this.memberForm.reset();
  }

  saveMember(): void {
    if (this.memberForm.invalid || !this.editingMemberId) {
      alert('Veuillez remplir correctement tous les champs.');
      return;
    }

    const memberData = this.allMembers.find(m => m.id === this.editingMemberId);
    if (!memberData) return;

    const payload: Member = {
      ...memberData,
      name: this.memberForm.value.name.trim(),
      email: this.memberForm.value.email.trim(),
      age: Number(this.memberForm.value.age),
      password: this.memberForm.value.password // Doit être fourni si form requis
    };

    this.coachService.updateMember(this.editingMemberId, payload).subscribe({
      next: () => {
        // Mettre à jour l'affichage
        const idxTeam = this.members.findIndex(m => m.id === this.editingMemberId);
        if (idxTeam !== -1) this.members[idxTeam] = payload;
        
        const idxAll = this.allMembers.findIndex(m => m.id === this.editingMemberId);
        if (idxAll !== -1) this.allMembers[idxAll] = payload;

        this.successMessage = `Membre "${payload.name}" modifié avec succès !`;
        this.cancelEditMember();
        setTimeout(() => { this.successMessage = ''; }, 3000);
      },
      error: (error: any) => {
        console.error(error);
        alert('Erreur lors de la modification. (Vérifiez que le mot de passe est rentré)');
      }
    });
  }

  deleteMemberCompletely(memberId: number | undefined): void {
    if (!memberId) return;
    if (confirm('Voulez-vous SUPPRIMER DÉFINITIVEMENT ce compte de la base de données ?')) {
      this.coachService.deleteMember(memberId).subscribe({
        next: () => {
          this.successMessage = 'Compte membre supprimé définitivement.';
          this.members = this.members.filter(m => m.id !== memberId);
          this.allMembers = this.allMembers.filter(m => m.id !== memberId);
          this.filterAvailableMembers();
          setTimeout(() => { this.successMessage = ''; }, 3000);
        },
        error: (error: any) => {
          console.error('Erreur:', error);
          this.errorMessage = 'Erreur lors de la suppression de base de données.';
        }
      });
    }
  }

  // --- ACTIONS SUR LES COURS ---

  // Pré-remplir le formulaire pour modification
  editCourse(course: Course): void {
    this.editingCourseId = course.id;
    
    // Convertir la date pour le champ datetime-local ("YYYY-MM-DDTHH:mm")
    let formattedDate = '';
    if (course.startAt) {
      const d = new Date(course.startAt);
      formattedDate = d.toISOString().slice(0, 16); // format attendu par datetime-local
    }

    this.courseForm.patchValue({
      title: course.title,
      description: course.description,
      startAt: formattedDate,
      durationMinutes: course.durationMinutes,
      maxParticipants: course.maxParticipants || (course as any).MaxParticipants || 10
    });

    // Scroll vers le formulaire
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void {
    this.editingCourseId = null;
    this.courseForm.reset();
  }

  // SAUVEGARDER (AJOUTER OU MODIFIER) UN COURS
  saveCourse(): void {
    console.log('=== SAUVEGARDE COURS ===');
    console.log('Valeurs formulaire:', this.courseForm.value);

    if (this.courseForm.invalid) {
      alert('Veuillez remplir tous les champs! Vérifiez que vous avez bien sélectionné une date et mis une durée (ex: 60).');
      this.errorMessage = 'Veuillez remplir tous les champs correctement';
      return;
    }

    // Récupérer la date du formulaire
    let startAtValue = this.courseForm.value.startAt;

    // Formater la date pour l'API
    let formattedDate: string;

    if (!startAtValue) {
      this.errorMessage = 'La date est requise';
      return;
    }

    // Si la date est au format datetime-local (YYYY-MM-DDTHH:mm)
    if (startAtValue.length === 16) {
      formattedDate = startAtValue + ':00';
    }
    // Si la date est déjà au format ISO
    else if (startAtValue.includes('T') && startAtValue.includes(':')) {
      formattedDate = startAtValue;
    }
    // Si c'est juste une date
    else {
      formattedDate = startAtValue + 'T00:00:00';
    }

    const newCourse = {
      title: this.courseForm.value.title.trim(),
      description: this.courseForm.value.description.trim(),
      startAt: formattedDate,
      durationMinutes: Number(this.courseForm.value.durationMinutes),
      maxParticipants: Number(this.courseForm.value.maxParticipants),
      coachId: this.coach.id
    };

    console.log('Données envoyées pour le cours:', JSON.stringify(newCourse, null, 2));

    if (this.editingCourseId) {
      // MODIFICATION
      this.coachService.updateCourse(this.editingCourseId, { ...newCourse, id: this.editingCourseId }).subscribe({
        next: () => {
          // Mettre à jour dans la liste locale
          const index = this.courses.findIndex(c => c.id === this.editingCourseId);
          if (index !== -1) {
            this.courses[index] = { ...newCourse, id: this.editingCourseId } as unknown as Course;
          }
          this.successMessage = `Cours "${newCourse.title}" modifié avec succès!`;
          this.cancelEdit();
          setTimeout(() => { this.successMessage = ''; }, 3000);
        },
        error: (error: any) => this.handleCourseError(error, "modification")
      });
    } else {
      // AJOUT
      this.coachService.createCourse(newCourse).subscribe({
        next: (course: Course) => {
          console.log('Cours ajouté avec succès:', course);
          this.courses.push(course);
          this.courseForm.reset();
          this.errorMessage = '';
          this.successMessage = `Cours "${course.title}" ajouté avec succès!`;
          setTimeout(() => { this.successMessage = ''; }, 3000);
        },
        error: (error: any) => this.handleCourseError(error, "création")
      });
    }
  }

  // Gestion unifiée des erreurs pour les cours
  private handleCourseError(error: any, action: string): void {
    console.error('ERREUR complète:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.error);

        let errorMsg = `Erreur lors de la ${action} du cours. `;

        if (error.status === 400) {
          if (typeof error.error === 'string') {
            errorMsg += error.error;
          } else if (error.error?.message) {
            errorMsg += error.error.message;
          } else if (error.error?.errors) {
            const errors = Object.values(error.error.errors).flat();
            errorMsg += errors.join(', ');
          } else {
            errorMsg += 'Vérifiez le format de la date et les données.';
          }
        } else if (error.status === 401) {
          errorMsg += 'Non autorisé. Veuillez vous reconnecter.';
        } else if (error.status === 0) {
          errorMsg += 'API inaccessible. Vérifiez que le serveur est lancé sur http://localhost:5280';
        } else {
          errorMsg += `Erreur ${error.status}`;
        }

        alert(`Échec de la ${action}: ` + errorMsg);
        this.errorMessage = errorMsg;
  }

  // L'ancienne méthode deleteMember a été remplacée par removeMemberFromTeam.
  
  // SUPPRIMER UN COURS
  deleteCourse(courseId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      this.coachService.deleteCourse(courseId).subscribe({
        next: () => {
          this.courses = this.courses.filter(c => c.id !== courseId);
          this.successMessage = 'Cours supprimé avec succès!';
          setTimeout(() => { this.successMessage = ''; }, 3000);
        },
        error: (error: any) => {
          console.error('Erreur:', error);
          this.errorMessage = 'Erreur lors de la suppression du cours';
        }
      });
    }
  }

  // DÉCONNEXION
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
