import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MemberService, Member, Subscription, Course, Coach } from './member.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.css']
})
export class MemberComponent implements OnInit {
  member: Member | null = null;
  subscription: Subscription | null = null;
  coach: Coach | null = null;
  courses: Course[] = [];
  allCourses: Course[] = []; // Catalogue complet
  loading: boolean = true;
  errorMessage: string = '';

  // Subscription modal
  showSubscriptionModal: boolean = false;
  availablePlans: Subscription[] = [];
  selectedPlanId: number | null = null;
  subscribing: boolean = false;
  subscribeError: string = '';
  subscribeSuccess: string = '';

  constructor(
    private authService: AuthService,
    private memberService: MemberService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.id) {
      this.loadMemberData(user.id);
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadMemberData(memberId: number, silent: boolean = false): void {
    if (!silent) this.loading = true;

    // Charger les informations du membre
    this.memberService.getMember(memberId).subscribe({
      next: (memberData: Member) => {
        this.member = memberData;
        this.coach = memberData.coach || null;

        // Charger l'abonnement
        this.memberService.getMemberSubscription(memberId).subscribe({
          next: (subscriptionData: Subscription) => {
            this.subscription = subscriptionData;
          },
          error: (err: any) => {
            console.error('Erreur chargement abonnement:', err);
            this.subscription = null;
          }
        });

        // Charger les cours inscrits
        this.memberService.getMemberCourses(memberId).subscribe({
          next: (coursesData: Course[]) => {
            this.courses = coursesData;

            // FALLBACK: Si le membre n'a pas de coach assigné directement,
            // on prend le coach du premier cours auquel il est inscrit.
            if (!this.coach && this.courses.length > 0) {
              const courseWithCoach = this.courses.find(c => c.coach);
              if (courseWithCoach) {
                this.coach = courseWithCoach.coach!;
              }
            }

            // Une fois les cours inscrits chargés, charger TOUS les cours
            this.loadAllCourses();
          },
          error: (err: any) => {
            console.error('Erreur chargement cours:', err);
            this.courses = [];
            this.loadAllCourses();
          }
        });
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors du chargement des données';
        this.loading = false;
        console.error('Erreur:', error);
      }
    });
  }

  loadAllCourses(): void {
    this.memberService.getAllCourses().subscribe({
      next: (data: Course[]) => {
        this.allCourses = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur catalogue cours:', err);
        this.loading = false;
      }
    });
  }

  isEnrolled(courseId: number): boolean {
    return this.courses.some(c => c.id === courseId);
  }

  getRemainingSpots(course: any): number {
    const max = course.maxParticipants || course.MaxParticipants || 10;
    const enrolled = course.members?.$values ? course.members.$values.length : (course.members?.length || 0);
    return Math.max(0, max - enrolled);
  }

  registerToCourse(courseId: number): void {
    const memberId = this.member ? (this.member.id || (this.member as any).Id) : null;
    if (!memberId) return;

    this.memberService.registerMemberToCourse(courseId, memberId).subscribe({
      next: () => {
        // Rafraîchir les listes
        this.loadMemberData(memberId, true);
      },
      error: (err: any) => {
        alert("Erreur lors de l'inscription : " + (err.error || err.message));
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openSubscriptionModal(): void {
    this.subscribeError = '';
    this.subscribeSuccess = '';
    this.selectedPlanId = null;
    this.showSubscriptionModal = true;
    this.memberService.getAllSubscriptions().subscribe({
      next: (plans: Subscription[]) => {
        this.availablePlans = plans;
      },
      error: () => {
        this.subscribeError = 'Impossible de charger les plans.';
      }
    });
  }

  closeSubscriptionModal(): void {
    this.showSubscriptionModal = false;
  }

  confirmSubscription(): void {
    // Attempting to extract IDs accurately (handling potential camelCase/PascalCase)
    const memberId = this.member ? (this.member.id || (this.member as any).Id) : null;
    const planId = this.selectedPlanId;

    if (!memberId || !planId || !this.availablePlans) {
      console.warn('DEBUG IDs - Member:', memberId, 'Plan:', planId);
      this.subscribeError = 'Données manquantes pour la souscription.';
      return;
    }

    this.subscribing = true;
    this.subscribeError = '';

    const chosenPlan = this.availablePlans.find(p => (p.id || (p as any).Id) === planId);

    this.memberService.subscribeMember(memberId, planId).subscribe({
      next: (response: any) => {
        console.log('Souscription OK:', response);
        this.subscribeSuccess = 'Félicitations ! Votre abonnement est actif.';

        if (chosenPlan) {
          this.subscription = chosenPlan;
        }

        // Rafraîchir toutes les données en arrière-plan
        this.loadMemberData(memberId);

        setTimeout(() => {
          this.showSubscriptionModal = false;
          this.subscribing = false;
          this.subscribeSuccess = '';
        }, 1200);
      },
      error: (err: any) => {
        console.error('Erreur détaillée:', err);

        // Extraire le message d'erreur (format string ou objet JSON)
        let message = 'Erreur lors de la souscription.';
        if (typeof err.error === 'string') {
          message = err.error;
        } else if (err.error?.message) {
          message = err.error.message;
        } else if (err.message) {
          message = err.message;
        }

        this.subscribeError = message;
        this.subscribing = false;
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isExpired(dateAt: any): boolean {
    if (!dateAt) return false;
    return new Date(dateAt) < new Date();
  }

  getSubscriptionStatus(): string {
    if (!this.subscription) return 'Aucun abonnement';
    return `Actif - ${this.subscription.durationInMonths} mois`;
  }

  getRole(): string {
    const user = this.authService.getCurrentUser();
    return user?.role || 'Membre';
  }

  downloadPDF() {
    if (!this.member) return;

    const doc = new jsPDF();
    const currentUser = this.authService.getCurrentUser();
    const role = currentUser?.role || 'Membre';

    // Design du PDF
    doc.setFillColor(230, 25, 25); // Rouge Apex
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('APEX PERFORMANCE CENTER', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('FICHE DE PROFIL OFFICIELLE', 105, 30, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 50);

    doc.setFontSize(16);
    doc.text('Informations du Profil', 20, 70);

    autoTable(doc, {
      startY: 80,
      head: [['Champ', 'Détail']],
      body: [
        ['Nom complet', this.member.name],
        ['Email', this.member.email],
        ['Âge', this.member.age || 'Non spécifié'],
        ['Rôle', role.toUpperCase()],
        ['Type d\'abonnement', this.subscription?.name || 'Aucun'],
        ['Statut du compte', 'Actif']
      ],
      theme: 'striped',
      headStyles: { fillColor: [230, 25, 25] }
    });

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const footerY = (doc as any).lastAutoTable.finalY + 20;
    doc.text('Document généré via le portail membre Apex Performance.', 105, footerY, { align: 'center' });
    doc.text('11-13 Rue de l\'Artisanat, El Ghazala, Ariana', 105, footerY + 7, { align: 'center' });

    doc.save(`Profil_Apex_${this.member.name}.pdf`);
  }
}
