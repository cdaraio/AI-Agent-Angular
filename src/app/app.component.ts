import { Component, ViewContainerRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule],
  template: `

    <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent {
  // Il ViewContainerRef viene usato in altri componenti
  constructor(public viewContainerRef: ViewContainerRef) {}
}
