import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbarModule],
  template: `
    <mat-toolbar color="primary">
      <span>Work Items</span>
    </mat-toolbar>
    <router-outlet />
  `,
  styles: [`
    :host { display: block; }
  `],
})
export class App {}
