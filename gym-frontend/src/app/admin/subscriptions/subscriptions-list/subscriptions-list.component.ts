import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-subscriptions-list',
  templateUrl: './subscriptions-list.component.html',
  styleUrls: ['./subscriptions-list.component.css']
})
export class SubscriptionsListComponent implements OnInit {
  subscriptions: any[] = [];
  loading = true;

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadSubscriptions();
  }

  loadSubscriptions() {
    this.loading = true;
    this.adminService.getSubscriptions().subscribe({
      next: (data) => {
        this.subscriptions = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  deleteSubscription(id: number) {
    if (confirm('Supprimer cet abonnement ?')) {
      this.adminService.deleteSubscription(id).subscribe(() => this.loadSubscriptions());
    }
  }
}
