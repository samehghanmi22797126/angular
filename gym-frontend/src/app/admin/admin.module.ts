import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';

import { DashboardComponent } from './dashboard/dashboard.component';
import { MembersListComponent } from './members/members-list/members-list.component';
import { MembersFormComponent } from './members/members-form/members-form.component';
import { CoachesListComponent } from './coaches/coaches-list/coaches-list.component';
import { CoachesFormComponent } from './coaches/coaches-form/coaches-form.component';
import { SubscriptionsListComponent } from './subscriptions/subscriptions-list/subscriptions-list.component';
import { SubscriptionsFormComponent } from './subscriptions/subscriptions-form/subscriptions-form.component';
import { OffresComponent } from './offres/offres.component';
import { CoursesListComponent } from './courses/courses-list/courses-list.component';
import { CoursesFormComponent } from './courses/courses-form/courses-form.component';
import { AdminProfileComponent } from './profile/admin-profile.component';
import { RecruitmentComponent } from './recruitment/recruitment.component';

@NgModule({
  declarations: [
    DashboardComponent,
    MembersListComponent,
    MembersFormComponent,
    CoachesListComponent,
    CoachesFormComponent,
    SubscriptionsListComponent,
    SubscriptionsFormComponent,
    OffresComponent,
    CoursesListComponent,
    CoursesFormComponent,
    AdminProfileComponent,
    RecruitmentComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
