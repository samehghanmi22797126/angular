import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-subscriptions-list',
  templateUrl: './subscriptions-list.component.html',
  styleUrls: ['./subscriptions-list.component.css']
})
export class SubscriptionsListComponent implements OnInit {
  subscriptions = [
    { id: 1, member: 'John Doe', type: 'Mensuel' },
    { id: 2, member: 'Jane Doe', type: 'Annuel' }
  ];

  constructor() { }

  ngOnInit(): void { }
}
