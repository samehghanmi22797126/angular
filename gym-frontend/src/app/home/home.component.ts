import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  // fonctions de test
  goToRegister() {
    console.log("Bouton S'inscrire cliqué");
  }

  goToLogin() {
    console.log("Bouton Se connecter cliqué");
  }

}
