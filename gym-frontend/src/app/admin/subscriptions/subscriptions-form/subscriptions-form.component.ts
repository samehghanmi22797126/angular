import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-subscriptions-form',
  templateUrl: './subscriptions-form.component.html',
  styleUrls: ['./subscriptions-form.component.css']
})
export class SubscriptionsFormComponent implements OnInit {
  isEdit = false;
  subId: number | null = null;
  loading = false;
  
  subscription: any = {
    name: '',
    price: 0,
    durationInMonths: 1,
    description: ''
  };

  constructor(
    private adminService: AdminService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.subId = +params['id'];
        this.isEdit = true;
        this.loadSubscription(this.subId);
      }
    });
  }

  loadSubscription(id: number) {
    this.loading = true;
    this.adminService.getSubscriptions().subscribe(subs => {
      const found = subs.find(s => s.id === id);
      if (found) {
        this.subscription = { ...found };
        this.loading = false;
      }
    });
  }

  onSubmit() {
    this.loading = true;
    if (this.isEdit && this.subId) {
      this.adminService.updateSubscription(this.subId, this.subscription).subscribe({
        next: () => this.router.navigate(['/admin/subscriptions']),
        error: (err) => { console.error(err); this.loading = false; }
      });
    } else {
      this.adminService.createSubscription(this.subscription).subscribe({
        next: () => this.router.navigate(['/admin/subscriptions']),
        error: (err) => { console.error(err); this.loading = false; }
      });
    }
  }
}
