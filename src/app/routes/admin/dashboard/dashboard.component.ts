import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Component, OnInit } from '@angular/core';
import { ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Prenotazione } from '../../../model/prenotazione';
import { PrenotazioniService } from '../../../service/dao/dao_prenotazioni.service';
import { UtentiService } from '../../../service/dao/dao_utenti.service';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { forkJoin } from 'rxjs';
import { MotivazioneEnum, MotivazioniUpdateLabels } from '../../../model/enums/motivazione_enum';

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

  // Colori grafici
  primaryBlue = 'rgba(52, 152, 219, 0.8)';
  accentRed = 'rgba(231, 76, 60, 0.8)';
  accentYellow = 'rgba(241, 196, 15, 0.8)';
  secondaryBlue = 'rgba(52, 152, 219, 0.5)';

  // Grafici
  bookingsPerMonthChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  motivationsChartData: ChartData<'pie'> = { labels: [], datasets: [] };

  // Opzioni grafici
  chartOptionsWithLegend = {
    responsive: true,
    plugins: {
      legend: {
        display: true, // Mostra la legenda
        position: 'top' as const,
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Numero di Prenotazioni',
        },
        ticks: {
          stepSize: 1,
          beginAtZero: true,
        },
      },
    },
  };

  chartOptionsWithoutLegend = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // Nasconde la legenda
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Motiviazioni Prenotazioni',
        },
        ticks: {
          stepSize: 1,
          beginAtZero: true,
        },
      },
    },
  };

  // Stati
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(
    private prenotazioniService: PrenotazioniService,
    private utentiService: UtentiService
  ) { }

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    this.isLoading = true;
    this.errorMessage = null;

    forkJoin({
      utenti: this.utentiService.getUtenti(),
      prenotazioni: this.prenotazioniService.getPrenotazioni(),
      recenti: this.prenotazioniService.getPrenotazioniRecenti()
    }).subscribe({
      next: ({ utenti, prenotazioni, recenti }) => {
        this.totalUsers = utenti.length;
        this.totalBookings = prenotazioni.length;
        this.recentBookings = recenti;
        this.initCharts(prenotazioni);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Errore nel caricamento dei dati';
        this.isLoading = false;
        console.error('Errore durante il caricamento:', err);
      }
    });
  }

  private initCharts(prenotazioni: Prenotazione[]): void {
    // Grafico mensile
    const monthlyData = this.groupByMonth(prenotazioni);
    this.bookingsPerMonthChartData = {
      labels: Object.keys(monthlyData),
      datasets: [{
        data: Object.values(monthlyData),
        label: 'Prenotazioni',
        backgroundColor: [
          this.accentRed,
          this.accentYellow,
          this.secondaryBlue
        ].slice(0, Object.keys(monthlyData).length),
        borderColor: [
          '#3498db',
          '#e74c3c',
          '#f1c40f'
        ].slice(0, Object.keys(monthlyData).length),
        borderWidth: 1
      }]
    };

    // Grafico motivazioni
    console.log("Motivazioni grezze:", prenotazioni.map(b => b.motivazione));
    console.log("Motivazioni convertite:", prenotazioni.map(b => this.getMotivazioneLabel(b.motivazione)));

    const motivationData = this.groupByMotivation(prenotazioni);
    console.log("Dati per il grafico:", motivationData);
    this.motivationsChartData = {
      labels: Object.keys(motivationData), // Queste ora sono le label descrittive
      datasets: [{
        data: Object.values(motivationData),
        label: 'Motivazioni',
        backgroundColor: [
          this.accentYellow,
          this.primaryBlue,
          this.accentRed,
          this.secondaryBlue
        ].slice(0, Object.keys(motivationData).length),
        borderWidth: 1,
        borderColor: '#fff'
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
    const counts: { [key: string]: number } = {};

    prenotazioni.forEach((prenotazione) => {
      const label = this.getMotivazioneLabel(prenotazione.motivazione);
      counts[label] = (counts[label] || 0) + 1;
    });

    return counts;
  }

  getMotivazioneLabel(motivazione: string | null | undefined): string {
    if (!motivazione) return 'Non specificato';
    const enumValue = Object.values(MotivazioneEnum).find(
      value => value === motivazione
    );
    if (enumValue) {
      return MotivazioniUpdateLabels[enumValue];
    }
    console.warn('Motivazione non riconosciuta:', motivazione);
    return motivazione; // Fallback: mostra il valore originale
  }

  formatDate(date: Date | string): string {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: it });
    } catch (e) {
      console.error('Errore formattazione data:', e);
      return 'Data non valida';
    }
  }
}
