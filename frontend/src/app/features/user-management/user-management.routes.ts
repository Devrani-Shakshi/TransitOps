import { Routes } from '@angular/router';
import { UserListComponent } from './user-list/user-list.component';

export const USER_MANAGEMENT_ROUTES: Routes = [
  { path: '', component: UserListComponent }
];
