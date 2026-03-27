import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MembersListComponent } from './members/members-list/members-list.component';
import { MembersFormComponent } from './members/members-form/members-form.component';
import { CoachesListComponent } from './coaches/coaches-list/coaches-list.component';
import { CoachesFormComponent } from './coaches/coaches-form/coaches-form.component';
import { SubscriptionsListComponent } from './subscriptions/subscriptions-list/subscriptions-list.component';
import { SubscriptionsFormComponent } from './subscriptions/subscriptions-form/subscriptions-form.component';

const routes: Routes = [
  {
    path: '',  // /admin
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'members', pathMatch: 'full' }, // redirige vers /admin/members
      { path: 'members', component: MembersListComponent },
      { path: 'members/add', component: MembersFormComponent },
      { path: 'coaches', component: CoachesListComponent },
      { path: 'coaches/add', component: CoachesFormComponent },
      { path: 'subscriptions', component: SubscriptionsListComponent },
      { path: 'subscriptions/add', component: SubscriptionsFormComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
