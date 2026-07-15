import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isError: boolean = false;
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  /**
   * Déclenchée lors de la soumission du formulaire de connexion.
   * Valide les entrées utilisateur, sollicite AuthService pour l'authentification réseau,
   * puis identifie le rôle associé de façon robuste pour rediriger l'utilisateur vers son espace personnel
   * (Espace Admin, Espace Coach ou Espace Membre).
   */
  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      this.isError = true;
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.isError = false;

    console.log('Tentative de connexion:', this.email);

    this.authService.login({ email: this.email, password: this.password })
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          console.log('Réponse:', response);

          // Extraire le rôle de façon robuste
          let userRole = this.extractRole(response) || this.getRoleFromEmail(this.email);
          userRole = userRole ? userRole.toUpperCase().trim() : 'MEMBER';

          switch (userRole) {
            case 'ADMIN':
              console.log('✅ REDIRECTION VERS ADMIN');
              this.router.navigate(['/admin']);
              break;
            case 'COACH':
              console.log('✅ REDIRECTION VERS COACH');
              this.router.navigate(['/coach']);
              break;
            case 'MEMBER':
            default:
              console.log('✅ REDIRECTION VERS MEMBER');
              this.router.navigate(['/member']);
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('Erreur:', error);
          this.errorMessage = error.error?.message || 'Email ou mot de passe incorrect';
          this.isError = true;
        }
      });
  }

  /**
   * Méthode de secours (fallback) permettant de déterminer le rôle de l'utilisateur
   * d'après la structure de son adresse e-mail si le serveur ne renvoie aucune indication explicite.
   * @param email L'adresse e-mail saisie par l'utilisateur.
   * @returns Le rôle identifié sous forme de chaîne de caractères (ADMIN, COACH ou MEMBER).
   */
  private getRoleFromEmail(email: string): string {
    if (email === 'admin@example.com' || email.includes('@admin')) {
      return 'ADMIN';
    } else if (email.includes('coach') || email.includes('@coach')) {
      return 'COACH';
    } else {
      return 'MEMBER';
    }
  }

  /**
   * Analyse récursivement et de manière extrêmement résiliente la réponse JSON de l'API
   * pour y extraire le rôle de l'utilisateur connecté.
   * Examine les clés directes, les clés encapsulées dans des wrappers ('user', 'data'),
   * les tableaux de rôles ainsi que le décodage interne du jeton d'accès JWT.
   * @param response L'objet de réponse retourné par l'API réseau.
   * @returns Le rôle extrait de l'objet, ou null si aucune correspondance n'est trouvée.
   */
  private extractRole(response: any): string | null {
    if (!response) return null;

    // 1) champ direct
    if (typeof response.role === 'string' && response.role) return response.role;

    // 2) roleName ou role_name
    if (typeof response.roleName === 'string' && response.roleName) return response.roleName;
    if (typeof response.role_name === 'string' && response.role_name) return response.role_name;

    // 3) tableau roles
    if (Array.isArray(response.roles) && response.roles.length > 0) {
      // prendre le premier rôle ou chercher COACH/ADMIN
      const found = response.roles.find((r: any) => typeof r === 'string' && !!r);
      if (found) return found;
    }

    // 4) objet user
    if (response.user) {
      if (typeof response.user.role === 'string') return response.user.role;
      if (Array.isArray(response.user.roles) && response.user.roles.length > 0) return response.user.roles[0];
      if (typeof response.user.roleName === 'string') return response.user.roleName;
    }

    // 5) wrapper data
    if (response.data) {
      if (typeof response.data.role === 'string') return response.data.role;
      if (Array.isArray(response.data.roles) && response.data.roles.length > 0) return response.data.roles[0];
    }

    // 6) token JWT : décoder le payload et chercher claims usuels
    const token = response.token || response.accessToken || response.access_token;
    if (typeof token === 'string') {
      const payload = this.decodeJwtPayload(token);
      if (payload) {
        // champs communs de claim
        if (typeof payload.role === 'string') return payload.role;
        if (Array.isArray(payload.roles) && payload.roles.length > 0) return payload.roles[0];
        if (typeof payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] === 'string')
          return payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        if (Array.isArray(payload['roles']) && payload['roles'].length > 0) return payload['roles'][0];
        // certains serveurs mettent le rôle sous "role[0]" ou "roles[0]" en string ; tenter une recherche souple
        for (const k of Object.keys(payload)) {
          const v = payload[k];
          if (typeof v === 'string' && /coach|admin|member/i.test(v)) return v;
          if (Array.isArray(v) && v.some((x: any) => typeof x === 'string' && /coach|admin|member/i.test(x))) {
            return v.find((x: any) => typeof x === 'string' && /coach|admin|member/i.test(x));
          }
        }
      }
    }

    return null;
  }

  /**
   * Décode la partie "payload" (charges utiles) d'un jeton d'accès sécurisé JWT
   * sans bibliothèque externe en utilisant les utilitaires atob standard du navigateur.
   * N'effectue aucun contrôle de signature (authentification brute locale).
   * @param token Le jeton d'accès JWT au format chaîne encodé Base64.
   * @returns L'objet JSON décodé représentant les revendications (claims) ou null si le jeton est malformé.
   */
  private decodeJwtPayload(token: string): any | null {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payload = parts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      // padding base64
      const pad = payload.length % 4;
      const padded = pad === 0 ? payload : payload + '='.repeat(4 - pad);
      const json = atob(padded);
      return JSON.parse(decodeURIComponent(escape(json)));
    } catch {
      return null;
    }
  }
}
