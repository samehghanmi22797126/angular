import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RecruitmentService } from '../services/recruitment.service';
import { ReviewService } from '../services/review.service';
import { VideoService } from '../services/video.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  jobOffers: any[] = [];
  reviews: any[] = [];
  isMember: boolean = false;
  isAdmin: boolean = false;
  isCoach: boolean = false;
  userName: string = '';

  videos: any[] = [];
  videoTitle: string = '';
  selectedVideoFile: File | null = null;

  newReview = {
    content: '',
    rating: 5,
    memberName: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private recruitmentService: RecruitmentService,
    private reviewService: ReviewService,
    private videoService: VideoService
  ) { }

  /**
   * Méthode du cycle de vie Angular déclenchée à l'initialisation du composant.
   * Charge les offres d'emploi, les avis des membres, les vidéos et vérifie le rôle de l'utilisateur connecté.
   */
  ngOnInit(): void {
    this.loadOffers();
    this.loadReviews();
    this.loadVideos();
    this.checkUserRole();
  }

  /**
   * Analyse la session stockée dans localStorage afin d'identifier le rôle de l'utilisateur connecté (Membre, Admin, Coach).
   * Initialise les variables de droits d'accès IHM et renseigne le nom par défaut pour l'écriture d'avis.
   */
  checkUserRole() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      this.isMember = user.role === 'member' || user.role === 'Member';
      this.isAdmin = user.role === 'admin' || user.role === 'Admin';
      this.isCoach = user.role === 'coach' || user.role === 'Coach';
      this.userName = user.name || 'Anonyme';
      if (this.isMember) {
        this.newReview.memberName = user.name || 'Membre Anonyme';
      }
    }
  }

  /**
   * Appelle le service d'avis pour charger l'ensemble des témoignages membres
   * et alimente le tableau destiné à l'affichage du carrousel.
   */
  loadReviews() {
    this.reviewService.getReviews().subscribe(data => this.reviews = data);
  }

  /**
   * Appelle le service vidéo pour récupérer la liste de toutes les vidéos
   * éducatives ou de présentation physique publiées.
   */
  loadVideos() {
    this.videoService.getVideos().subscribe({
      next: (data) => this.videos = data,
      error: (err) => console.error('Erreur vidéos:', err)
    });
  }

  /**
   * Gestionnaire d'événement déclenché lors du choix d'un fichier vidéo dans le formulaire d'ajout.
   * Récupère le premier fichier de la sélection.
   * @param event L'événement d'IHM contenant les fichiers sélectionnés.
   */
  onVideoFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedVideoFile = event.target.files[0];
    }
  }

  /**
   * Soumet le fichier vidéo sélectionné et son titre au service d'upload.
   * En cas de succès, recharge la liste de vidéos et réinitialise le formulaire.
   */
  uploadVideo() {
    if (!this.selectedVideoFile || !this.videoTitle) {
      alert('Veuillez fournir un titre et sélectionner une vidéo.');
      return;
    }
    this.videoService.uploadVideo(this.selectedVideoFile, this.videoTitle, this.userName).subscribe({
      next: () => {
        alert('Vidéo ajoutée avec succès !');
        this.videoTitle = '';
        this.selectedVideoFile = null;
        this.loadVideos();
      },
      error: (err) => {
        console.error(err);
        alert('Erreur lors de l\'ajout de la vidéo.');
      }
    });
  }

  /**
   * Supprime définitivement une vidéo après confirmation visuelle par l'utilisateur.
   * @param id L'identifiant unique de la vidéo à détruire.
   */
  deleteVideo(id: number) {
    if (confirm('Voulez-vous vraiment supprimer cette vidéo ?')) {
      this.videoService.deleteVideo(id).subscribe({
        next: () => {
          alert('Vidéo supprimée !');
          this.loadVideos();
        },
        error: (err) => {
          console.error(err);
          alert('Erreur lors de la suppression.');
        }
      });
    }
  }

  /**
   * Soumet le nouvel avis rédigé par un membre (note et texte) au ReviewService.
   * Nettoie le champ et recharge la liste d'avis en cas de succès.
   */
  submitReview() {
    if (!this.newReview.content) return;
    this.reviewService.postReview(this.newReview).subscribe({
      next: () => {
        this.newReview.content = '';
        this.loadReviews();
        alert('Merci pour votre avis !');
      }
    });
  }

  /**
   * Appelle le service de recrutement pour charger les offres d'emploi actives.
   */
  loadOffers() {
    this.recruitmentService.getOffers().subscribe({
      next: (data) => this.jobOffers = data,
      error: (err) => console.error('Erreur offres:', err)
    });
  }

  /**
   * Gère le dépôt de CV pour une offre d'emploi.
   * Filtre la sélection pour n'accepter que les fichiers PDF.
   * Demande interactivement le nom/email du candidat si celui-ci n'est pas connecté,
   * puis transmet le dossier au RecruitmentService.
   * @param event L'événement IHM contenant le fichier PDF.
   * @param jobId L'identifiant de l'offre d'emploi visée.
   */
  onFileSelected(event: any, jobId: number) {
    const file: File = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Seul le format PDF est accepté.');
        return;
      }

      // Récupérer les infos du candidat
      let candidateName = 'Candidat Anonyme';
      let candidateEmail = '';

      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        candidateName = user.name || 'Candidat Anonyme';
        candidateEmail = user.email || '';
      }

      // Si pas d'email, demander au candidat
      if (!candidateEmail) {
        candidateEmail = prompt('Veuillez entrer votre email pour recevoir une réponse :') || '';
        if (!candidateEmail) {
          alert('Un email est nécessaire pour soumettre votre candidature.');
          return;
        }
      }
      if (!candidateName || candidateName === 'Candidat Anonyme') {
        const name = prompt('Veuillez entrer votre nom complet :');
        if (name) candidateName = name;
      }

      this.recruitmentService.apply(jobId, file, candidateName, candidateEmail).subscribe({
        next: (res) => {
          alert('Votre CV a été envoyé avec succès ! Vous recevrez une réponse par email.');
          this.loadOffers();
        },
        error: (err) => alert('Erreur lors de l\'envoi du CV.')
      });
    }
  }

  /**
   * Redirige l'internaute vers le formulaire de création de compte.
   */
  goToRegister() {
    this.router.navigate(['/register']);
  }

  /**
   * Redirige l'internaute vers la page de connexion.
   */
  goToLogin() {
    this.router.navigate(['/login']);
  }
}
