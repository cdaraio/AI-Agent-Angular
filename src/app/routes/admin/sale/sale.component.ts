import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SaleService } from '../../../service/dao/dao_sale.service';

@Component({
  selector: 'app-sale',
  templateUrl: './sale.component.html',
  styleUrls: ['./sale.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ]
})
export class SaleComponent implements OnInit {
  sale: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private saleService: SaleService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.caricaSale();
  }

  caricaSale(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.saleService.getSale().subscribe({
      next: (response) => {
        this.sale = response;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Errore durante il caricamento delle sale';
        console.error('Errore:', error);
        this.isLoading = false;
        this.snackBar.open('Errore durante il caricamento delle sale', 'Chiudi', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }
}
