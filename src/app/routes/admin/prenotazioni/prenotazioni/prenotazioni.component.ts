import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrenotazioniService } from '../../../../service/dao/dao_prenotazioni.service';
import { RouterModule } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-prenotazioni',
  templateUrl: './prenotazioni.component.html',
  styleUrls: ['./prenotazioni.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ]
})
export class PrenotazioniComponent implements OnInit {
  prenotazioni: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private prenotazioniService: PrenotazioniService) { }

  ngOnInit(): void {
    this.caricaPrenotazioni();
  }

  calculateDuration(start: string | Date, end: string | Date): string {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = endDate.getTime() - startDate.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  }

  caricaPrenotazioni(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.prenotazioniService.getPrenotazioni().subscribe({
      next: (response) => {
        this.prenotazioni = response;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Errore durante il caricamento delle prenotazioni';
        console.error('Errore:', error);
        this.isLoading = false;
      }
    });
  }
}
