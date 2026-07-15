import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { User, UserService } from '../../services/user.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {
  users: User[] = [];
  sub = new Subscription();
  newUser: Partial<User> = { email: '', name: '', role: 'MEMBER' };
  loading = false;
  error = '';

    constructor(public userService: UserService) {}

  ngOnInit(): void {
    this.sub.add(this.userService.users$.subscribe(users => this.users = users));
    // Chargement initial
    this.userService.getUsers().subscribe({
      error: () => this.error = 'Impossible de charger la liste'
    });
  }

  addUser(): void {
    if (!this.newUser.email) {
      this.error = 'Email requis';
      return;
    }
    this.loading = true;
    this.error = '';
    this.userService.addUser(this.newUser).subscribe({
      next: (created) => {
        this.loading = false;
        if (!created) {
          // backend n'a pas renvoyé l'objet -> la liste a été rechargée par le service
        }
        // reset form
        this.newUser = { email: '', name: '', role: 'MEMBER' };
      },
      error: () => {
        this.loading = false;
        this.error = 'Erreur lors de la création';
      }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
