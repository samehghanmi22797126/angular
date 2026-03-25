import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  credentials = { email: '', password: '' };
  message: string | null = null;
  isError = false;
  isLoading = false;

  constructor(private auth: AuthService, private router: Router) { }

  onSubmit() {
    this.message = null;
    this.isError = false;
    this.isLoading = true;

    this.auth.login(this.credentials).subscribe({
      next: res => {
        this.isLoading = false;
        // store user info locally and redirect based on role
        try { localStorage.setItem('user', JSON.stringify(res)); } catch { }
        const role = (res.role || res.Role || '').toString().toLowerCase();
        if (role === 'admin') {
          this.router.navigate(['/admin']);
        } else if (role === 'coach') {
          this.router.navigate(['/coach']);
        } else {
          this.router.navigate(['/compte']);
        }
      },
      error: err => {
        this.isLoading = false;
        console.error('login error', err);
        this.isError = true;
        // prefer to show server message if available
        this.message = (err?.error && typeof err.error === 'string') ? err.error : 'Échec de connexion. Vérifiez vos identifiants.';
      }
    });
  }
}
