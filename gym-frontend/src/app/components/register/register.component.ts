import { Component } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  user = {
    name: '',
    age: '',
    email: '',
    password: '',
    role: ''
  };

  onSubmit() {
    // For now just log the user object. In a real app you'd send this to the backend.
    // ensure age is a number
    const payload = { ...this.user, age: this.user.age ? Number(this.user.age) : null };
    console.log('Register submit', payload);
    alert('Inscription envoyée: ' + (payload.email || ''));
  }

}
