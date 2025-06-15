import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-utenti',
  templateUrl: './utenti.component.html',
  styleUrls: ['./utenti.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    RouterLink,
    MatProgressSpinnerModule
  ]
})
export class UtentiComponent implements OnInit {
  utenti: any[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.data.subscribe({
      next: ({ utenti }) => {
        this.utenti = utenti || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Errore nel caricamento degli utenti';
        this.isLoading = false;
        console.error('Errore:', err);
      }
    });
  }

  refreshData(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.route.data.subscribe({
      next: ({ utenti }) => {
        this.utenti = utenti || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.handleError(err);
      }
    });
  }

  private handleError(error: any): void {
    this.errorMessage = 'Errore durante il refresh dei dati';
    this.isLoading = false;
    console.error('Errore:', error);
  }
}
