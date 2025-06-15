import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../../service/dao/dao_auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  readonly isSidenavCollapsed = signal(false);
  isHovered = false;

  constructor(private readonly authService: AuthService) { }

  toggleSidenav(): void {
    this.isSidenavCollapsed.update(v => !v);
  }


  logout(): void {
    this.authService.logout();
  }

  get userEmail(): string | null {
    return this.authService.getUser()?.email || null;
  }

  onSidebarHover(hovered: boolean): void {
  this.isHovered = hovered;
}
}
