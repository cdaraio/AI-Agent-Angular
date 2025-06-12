import { Component, OnInit } from '@angular/core';
import { UtentiService } from '../../../service/dao/dao_utenti.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-utenti',
  templateUrl: './utenti.component.html',
  styleUrls: ['./utenti.component.scss'],
  imports:[
    CommonModule
  ]
})
export class UtentiComponent implements OnInit {
  utenti: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private utentiService: UtentiService) { }

  ngOnInit(): void {
    this.caricaUtenti();
  }

  caricaUtenti(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.utentiService.getUtenti().subscribe({
      next: (response) => {
        this.utenti = response;
        console.log(response)
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Errore durante il caricamento degli utenti';
        console.error('Errore:', error);
        this.isLoading = false;
      }
    });
  }
}
