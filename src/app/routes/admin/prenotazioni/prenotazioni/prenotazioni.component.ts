import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-prenotazioni',
  templateUrl: './prenotazioni.component.html',
  styleUrls: ['./prenotazioni.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    RouterLink,
  ]
})
export class PrenotazioniComponent implements OnInit, OnDestroy {
  prenotazioni: any[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  private routeDataSub!: Subscription;

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    if (this.routeDataSub) {
      this.routeDataSub.unsubscribe();
    }
  }

  private loadData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    if (this.routeDataSub) {
      this.routeDataSub.unsubscribe();
    }

    this.routeDataSub = this.route.data.subscribe({
      next: ({ prenotazioni }) => {
        this.prenotazioni = prenotazioni || [];
        this.isLoading = false;
        this.errorMessage = null;
      },
      error: (err) => {
        this.handleError(err);
      }
    });
  }

  private handleError(error: any): void {
    console.error('Errore nel caricamento:', error);
    this.isLoading = false;
    this.errorMessage = 'Errore nel caricamento delle prenotazioni';
  }

  calculateDuration(start: string | Date, end: string | Date): string {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = endDate.getTime() - startDate.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  }

  refreshData(): void {
  this.isLoading = true;
  this.errorMessage = null;

  // Forza il reload completo della route incluso il resolver
  this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
    this.router.navigate(['/admin/bookings']).then(() => {
      this.isLoading = false;
    });
  });
}
}
