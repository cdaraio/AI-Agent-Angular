
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Prenotazione } from '../../../model/prenotazione';
import { Utente } from '../../../model/utente';
import { PrenotazioniService } from '../../../service/dao/dao_prenotazioni.service';
import { UtentiService } from '../../../service/dao/dao_utenti.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    BaseChartDirective
  ]
})
export class DashboardComponent implements OnInit {
  // Statistiche
  totalUsers: number = 0;
  totalBookings: number = 0;
  recentBookings: Prenotazione[] = [];

  // Grafici - inizializza con struttura vuota
  bookingsPerMonthChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  motivationsChartData: ChartData<'pie'> = {
    labels: [],
    datasets: []
  };

  // Opzioni condivise
  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    }
  };

  // Stati
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(
    private prenotazioniService: PrenotazioniService,
    private utentiService: UtentiService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    this.isLoading = true;
    this.errorMessage = null;

    // Carica utenti
    this.utentiService.getUtenti().subscribe({
      next: (utenti: Utente[]) => {
        this.totalUsers = utenti.length;
        this.checkLoadingComplete();
      },
      error: (err) => this.handleError('Errore nel caricamento utenti')
    });

    // Carica prenotazioni
    this.prenotazioniService.getPrenotazioni().subscribe({
      next: (prenotazioni: Prenotazione[]) => {
        this.totalBookings = prenotazioni.length;
        this.recentBookings = this.getRecentBookings(prenotazioni);
        this.initCharts(prenotazioni);
        this.checkLoadingComplete();
      },
      error: (err) => this.handleError('Errore nel caricamento prenotazioni')
    });
  }


  private initCharts(prenotazioni: Prenotazione[]): void {
    // Grafico prenotazioni per mese (bar)
    const monthlyData = this.groupByMonth(prenotazioni);
    this.bookingsPerMonthChartData = {
      labels: Object.keys(monthlyData),
      datasets: [{
        data: Object.values(monthlyData),
        label: 'Prenotazioni',
        backgroundColor: 'rgba(79, 70, 229, 0.6)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1
      }]
    };
    const motivationData = this.groupByMotivation(prenotazioni);
    this.motivationsChartData = {
      labels: Object.keys(motivationData),
      datasets: [{
        data: Object.values(motivationData),
        label: 'Motivazioni',
        backgroundColor: [
          'rgba(79, 70, 229, 0.6)',
          'rgba(16, 185, 129, 0.6)',
          'rgba(245, 158, 11, 0.6)',
          'rgba(239, 68, 68, 0.6)'
        ],
        borderWidth: 1
      }]
    };
  }


  private groupByMonth(prenotazioni: Prenotazione[]): { [key: string]: number } {
    return prenotazioni.reduce((acc, prenotazione) => {
      const date = new Date(prenotazione.data_ora_inizio);
      const monthYear = `${date.toLocaleString('it-IT', { month: 'short' })} ${date.getFullYear()}`;
      acc[monthYear] = (acc[monthYear] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  private groupByMotivation(prenotazioni: Prenotazione[]): { [key: string]: number } {
    return prenotazioni.reduce((acc, prenotazione) => {
      const motivazione = prenotazione.motivazione || 'Non specificato';
      acc[motivazione] = (acc[motivazione] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  private getRecentBookings(prenotazioni: Prenotazione[]): Prenotazione[] {
    return [...prenotazioni]
      .sort((a, b) => new Date(b.data_ora_inizio).getTime() - new Date(a.data_ora_inizio).getTime())
      .slice(0, 5);
  }

  private checkLoadingComplete(): void {
    if (this.totalUsers !== 0 && this.totalBookings !== 0) {
      this.isLoading = false;
    }
  }

  private handleError(message: string): void {
    this.errorMessage = message;
    this.isLoading = false;
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleString('it-IT');
  }
}
