import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'work-items', pathMatch: 'full' },
  {
    path: 'work-items',
    loadComponent: () =>
      import('./work-items/work-items-list/work-items-list.component').then(m => m.WorkItemsListComponent),
  },
];
