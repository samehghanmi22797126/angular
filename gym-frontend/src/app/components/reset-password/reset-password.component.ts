import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  template: `
    <div class="login-wrapper">
      <div class="login-container">
        <div class="login-card">
          <div class="brand-section">
            <h1 class="brand-title">APEX <span>PERFORMANCE</span></h1>
            <p class="brand-subtitle">Réinitialisation de votre mot de passe</p>
          </div>

          <div class="form-section">
            <div *ngIf="message" class="alert-message success">
              {{ message }}
            </div>
            
            <div *ngIf="error" class="alert-message error">
              {{ error }}
            </div>

            <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" *ngIf="!message">
              <p class="info-text">Saisissez votre nouveau mot de passe ci-dessous.</p>
              
              <div class="input-group">
                <input type="password" 
                       formControlName="password" 
                       class="form-input" 
                       placeholder="Nouveau mot de passe"
                       [class.invalid]="f['password'].touched && f['password'].errors">
                <div *ngIf="f['password'].touched && f['password'].errors" class="error-text">
                  <span *ngIf="f['password'].errors['required']">Le mot de passe est requis.</span>
                  <span *ngIf="f['password'].errors['minlength']">Minimum 6 caractères.</span>
                </div>
              </div>

              <div class="input-group">
                <input type="password" 
                       formControlName="confirmPassword" 
                       class="form-input" 
                       placeholder="Confirmer le mot de passe"
                       [class.invalid]="f['confirmPassword'].touched && resetForm.errors?.['mismatch']">
                <div *ngIf="f['confirmPassword'].touched && resetForm.errors?.['mismatch']" class="error-text">
                  Les mots de passe ne correspondent pas.
                </div>
              </div>

              <button type="submit" class="btn-login" [disabled]="resetForm.invalid || loading">
                <span *ngIf="!loading">Changer mon mot de passe</span>
                <span *ngIf="loading">Traitement...</span>
              </button>
            </form>

            <div class="register-link">
              <p><a routerLink="/login">Retour à la connexion</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #0c0c0c;
      background-image: 
        radial-gradient(circle at 0% 0%, rgba(230, 25, 25, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 100% 100%, rgba(230, 25, 25, 0.05) 0%, transparent 50%);
      padding: 20px;
    }
    .login-container { width: 100%; max-width: 450px; }
    .login-card {
      background: #141414;
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .brand-section {
      background: #1a1a1a;
      padding: 40px 30px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .brand-title { font-size: 2rem; font-weight: 900; color: white; margin: 0; letter-spacing: -1px; }
    .brand-title span { color: #e61919; }
    .brand-subtitle { color: #888; margin-top: 10px; font-size: 0.9rem; }
    .form-section { padding: 40px 30px; }
    .info-text { color: #888; margin-bottom: 25px; font-size: 0.9rem; }
    .input-group { margin-bottom: 20px; position: relative; }
    .form-input {
      width: 100%;
      background: #1a1a1a;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      padding: 15px;
      color: white;
      font-size: 1rem;
      transition: all 0.3s;
    }
    .form-input:focus { outline: none; border-color: #e61919; background: #222; }
    .form-input.invalid { border-color: #e61919; }
    .error-text { color: #e61919; font-size: 0.75rem; margin-top: 5px; }
    .btn-login {
      width: 100%;
      background: #e61919;
      color: white;
      border: none;
      border-radius: 10px;
      padding: 15px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s;
      margin-top: 10px;
    }
    .btn-login:hover:not(:disabled) {
      background: #ff3333;
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(230, 25, 25, 0.2);
    }
    .btn-login:disabled { opacity: 0.5; cursor: not-allowed; }
    .alert-message { padding: 15px; border-radius: 10px; margin-bottom: 20px; font-size: 0.9rem; text-align: center; }
    .alert-message.success { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
    .alert-message.error { background: rgba(230, 25, 25, 0.1); color: #e61919; border: 1px solid rgba(230, 25, 25, 0.2); }
    .register-link { margin-top: 30px; text-align: center; }
    .register-link a { color: #888; text-decoration: none; font-weight: 600; transition: color 0.3s; }
    .register-link a:hover { color: white; }
  `]
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  token: string = '';
  email: string = '';
  loading: boolean = false;
  message: string = '';
  error: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    this.resetForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      this.email = params['email'] || '';
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  get f() { return this.resetForm.controls; }

  onSubmit(): void {
    if (this.resetForm.invalid) {
      return;
    }

    this.loading = true;
    const apiUrl = 'http://localhost:5280/api/Auth/reset-password';
    
    const payload = {
      email: this.email,
      token: this.token,
      newPassword: this.resetForm.value.password
    };

    this.http.post<any>(apiUrl, payload).subscribe({
      next: (res) => {
        this.loading = false;
        this.message = 'Mot de passe réinitialisé avec succès.';
        this.error = '';
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || err.error || 'Erreur lors de la réinitialisation du mot de passe.';
        this.message = '';
      }
    });
  }
}
