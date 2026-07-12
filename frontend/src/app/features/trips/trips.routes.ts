import { Routes } from '@angular/router';
import { TripDispatcherComponent } from './trip-dispatcher/trip-dispatcher.component';
import { TripLiveBoardComponent } from './trip-live-board/trip-live-board.component';

export const TRIPS_ROUTES: Routes = [
  { path: 'dispatch', component: TripDispatcherComponent },
  { path: 'live-board', component: TripLiveBoardComponent },
  { path: '', redirectTo: 'dispatch', pathMatch: 'full' }
];
