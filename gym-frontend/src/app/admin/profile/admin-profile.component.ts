import { Component, OnInit } from '@angular/core';
import { AdminService } from '../services/admin.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-profile',
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.css']
})
export class AdminProfileComponent implements OnInit {
  admin: any = {
    name: '',
    email: '',
    password: ''
  };
  loading = false;
  successMessage = '';

  constructor(
    private adminService: AdminService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.id) {
      this.adminService.getAdminProfile(currentUser.id).subscribe(data => {
        this.admin = { ...data, password: '' };
      });
    }
  }

  onSubmit() {
    this.loading = true;
    this.successMessage = '';
    
    this.adminService.updateAdminProfile(this.admin.id, this.admin).subscribe({
      next: (res) => {
        this.successMessage = 'Profil mis à jour avec succès.';
        this.loading = false;
        // Optionnel : Mettre à jour le nom dans le localStorage via AuthService
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }
}
