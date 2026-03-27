import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';

import { DashboardComponent } from './dashboard/dashboard.component';
import { MembersListComponent } from './members/members-list/members-list.component';
import { MembersFormComponent } from './members/members-form/members-form.component';
import { CoachesListComponent } from './coaches/coaches-list/coaches-list.component';
import { CoachesFormComponent } from './coaches/coaches-form/coaches-form.component';
import { SubscriptionsListComponent } from './subscriptions/subscriptions-list/subscriptions-list.component';
import { SubscriptionsFormComponent } from './subscriptions/subscriptions-form/subscriptions-form.component';

@NgModule({
  declarations: [
    DashboardComponent,
    MembersListComponent,
    MembersFormComponent,
    CoachesListComponent,
    CoachesFormComponent,
    SubscriptionsListComponent,
    SubscriptionsFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
