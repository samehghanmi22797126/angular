import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-subscriptions-form',
  templateUrl: './subscriptions-form.component.html',
  styleUrls: ['./subscriptions-form.component.css']
})
export class SubscriptionsFormComponent implements OnInit {
  subscription = { member: '', type: '' };

  constructor() { }

  ngOnInit(): void { }

  onSubmit() {
    console.log('Abonnement soumis:', this.subscription);
    alert('Abonnement ajouté avec succès !');
  }
}
