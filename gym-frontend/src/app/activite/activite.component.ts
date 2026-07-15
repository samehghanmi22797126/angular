import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-activite',
  templateUrl: './activite.component.html',
  styleUrls: ['./activite.component.css']
})
export class ActiviteComponent {
  activities = [
    {
      id: 1,
      title: 'Musculation',
      description: 'Développez votre force et sculptez votre physique avec nos équipements de pointe et nos poids libres.',
      icon: '🏋️‍♂️',
      intensity: 'Haute',
      color: '#e61919'
    },
    {
      id: 2,
      title: 'Cardio Training',
      description: 'Améliorez votre endurance et brûlez des calories sur nos tapis, vélos et machines elliptiques de dernière génération.',
      icon: '🏃‍♂️',
      intensity: 'Moyenne',
      color: '#ff4d4d'
    },
    {
      id: 3,
      title: 'CrossFit',
      description: 'Un entraînement intensif combinant haltérophilie, gymnastique et cardio pour une condition physique globale.',
      icon: '⚙️',
      intensity: 'Extrême',
      color: '#b30000'
    },
    {
      id: 4,
      title: 'Yoga & Bien-être',
      description: 'Retrouvez l\'équilibre entre le corps et l\'esprit avec nos séances de yoga, de stretching et de relaxation.',
      icon: '🧘‍♂️',
      intensity: 'Focus',
      color: '#ff8080'
    }
  ];

  constructor(private authService: AuthService) {}

  get isMember(): boolean {
    const user = this.authService.getCurrentUser();
    return !user || user.role === 'member';
  }
}
