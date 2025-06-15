import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, throwError } from 'rxjs';
import { startWith, map, catchError } from 'rxjs/operators';
import { PrenotazioniService } from '../../../../../service/dao/dao_prenotazioni.service';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { MotivazioneDeleteEnum, MotivazioniDelete, MotivazioniDeleteLabels } from '../../../../../model/enums/motivazione_delete_enum';
import { MotivazioneEnum, MotivazioniUpdate, MotivazioniUpdateLabels } from '../../../../../model/enums/motivazione_enum';
import { DeletePrenotazioneDTO } from '../../../../../model/dto/delete_prenotazione_dto';
import { differenceInHours, isBefore } from 'date-fns';

@Component({
  selector: 'app-edit-prenotazione',
  templateUrl: './prenotazione.component.html',
  styleUrls: ['./prenotazione.component.scss'],
  imports: [
    MatInputModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatSelectModule
  ],
  standalone: true
})
export class PrenotazioneComponent implements OnInit {
  prenotazioneForm: FormGroup;
  deleteForm: FormGroup;
  idPrenotazione: number | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  showDeleteConfirm = false;
  motivazioniDelete = MotivazioniDelete;
  motivazioniModify = MotivazioniUpdate;
  filteredMotivazioni: Observable<{ value: MotivazioneEnum; label: string }[]>;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private prenotazioniService: PrenotazioniService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.prenotazioneForm = this.fb.group({
      data_ora_inizio: ['', Validators.required],
      data_ora_fine: ['', Validators.required],
      id_sala: ['', [Validators.required, Validators.min(1)]],
      motivazione: [{ value: '', disabled: false }, Validators.required] // Modificato qui
    });

    this.deleteForm = this.fb.group({
      motivazione: ['', Validators.required],
      note_aggiuntive: ['']
    });

    this.filteredMotivazioni = this.prenotazioneForm.get('motivazione')!.valueChanges.pipe(
      startWith(''),
      map(value => this.filterMotivazioni(value || ''))
    );
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && !isNaN(+idParam)) {
      this.idPrenotazione = +idParam;
      this.caricaDatiPrenotazione();
    } else {
      this.handleInvalidId();
    }
  }

  private filterMotivazioni(value: string): { value: MotivazioneEnum; label: string }[] {
    const filterValue = value.toLowerCase();
    return this.motivazioniModify.filter(motivazione =>
      motivazione.label.toLowerCase().includes(filterValue) ||
      motivazione.value.toLowerCase().includes(filterValue)
    );
  }

  private handleInvalidId(): void {
    this.errorMessage = 'ID prenotazione non valido';
    setTimeout(() => this.router.navigate(['/admin/bookings']), 2000);
  }

  caricaDatiPrenotazione(): void {
    if (!this.idPrenotazione) return;

    this.isLoading = true;
    this.errorMessage = null;

    this.prenotazioniService.getPrenotazioneById(this.idPrenotazione).pipe(
      catchError(error => {
        this.errorMessage = 'Errore nel caricamento della prenotazione';
        this.isLoading = false;
        return throwError(() => error);
      })
    ).subscribe({
      next: (prenotazione) => {
        try {
          // Trova la motivazione corrispondente nell'enum
          const motivazione = this.motivazioniModify.find(m => m.value === prenotazione.motivazione);

          this.prenotazioneForm.patchValue({
            // Converti le date nel formato corretto per l'input datetime-local
            data_ora_inizio: this.formatDateForInput(prenotazione.data_ora_inizio),
            data_ora_fine: this.formatDateForInput(prenotazione.data_ora_fine),
            id_sala: prenotazione.id_sala,
            motivazione: motivazione ? motivazione.value : prenotazione.motivazione || ''
          });
        } catch (e) {
          console.error('Errore nel formato dei dati ricevuti:', e);
          this.errorMessage = 'Errore nel formato dei dati ricevuti';
        }
        this.isLoading = false;
      }
    });
  }

  private formatDateForInput(dateString: string | Date): string {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) throw new Error('Invalid date');
    return date.toISOString().slice(0, 16);
  }
  private validatePrenotazioneModificabile(dataOraInizio: string | Date): void {
    const now = new Date();
    const inizio = new Date(dataOraInizio);

    if (isNaN(inizio.getTime())) {
      throw new Error('Data di inizio non valida');
    }

    // Controlla se la data inizio è già passata
    if (isBefore(inizio, now)) {
      throw new Error('La prenotazione non può essere modificata poiché la data di inizio è già passata');
    }

    // Calcola la differenza in ore
    const hoursDifference = differenceInHours(inizio, now);

    if (hoursDifference < 48) {
      throw new Error('La prenotazione può essere modificata solo se mancano almeno 48 ore all\'inizio');
    }
  }


  onSubmit(): void {
    if (!this.prenotazioneForm.valid || !this.idPrenotazione) return;
    try {
      // Validazione delle 48 ore
      this.validatePrenotazioneModificabile(this.prenotazioneForm.value.data_ora_inizio);
      this.isLoading = true;
      this.errorMessage = null;
      const payload = {
        ...this.prenotazioneForm.value,
        // Converti le date in stringhe ISO (senza timezone)
        data_ora_inizio: this.formatDateForBackend(this.prenotazioneForm.value.data_ora_inizio),
        data_ora_fine: this.formatDateForBackend(this.prenotazioneForm.value.data_ora_fine),
        // Invia direttamente il valore dell'enum
        motivazione: this.prenotazioneForm.value.motivazione
      };
      this.prenotazioniService.modificaPrenotazione(this.idPrenotazione, payload).subscribe({
        next: () => {
          this.snackBar.open('Prenotazione modificata con successo', 'Chiudi', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/admin/bookings']);
        },
        error: (err) => {
          this.handleModifyError(err);
          this.isLoading = false;
        }
      });
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Errore di validazione';
      this.isLoading = false;
    }
  }

  private formatDateForBackend(dateString: string): string {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) throw new Error('Invalid date');
    // Formato ISO senza informazioni sul timezone
    return date.toISOString().split('.')[0];
  }

  private handleModifyError(err: any): void {
    console.error('Errore durante la modifica:', err);
    if (err.error?.detail) {
      if (typeof err.error.detail === 'string') {
        this.errorMessage = err.error.detail;
      } else if (err.error.detail.code === 'SALA_NOT_FOUND') {
        this.errorMessage = 'Errore: il numero della sala inserito non esiste.';
        this.prenotazioneForm.get('id_sala')?.setErrors({ invalid: true });
      } else if (err.error.detail.message) {
        this.errorMessage = err.error.detail.message;
      }
    } else {
      this.errorMessage = 'Errore durante il salvataggio';
    }
  }

  confirmDelete() {
    if (!this.idPrenotazione || this.deleteForm.invalid) return;
    try {
      this.isLoading = true;
      const deleteRequest: DeletePrenotazioneDTO = {
        motivazione: this.deleteForm.value.motivazione,
        note_aggiuntive: this.deleteForm.value.note_aggiuntive || null
      };
      console.log(deleteRequest)
      this.prenotazioniService.deletePrenotazione(this.idPrenotazione, deleteRequest).subscribe({
        next: () => {
          this.snackBar.open('Prenotazione eliminata con successo', 'Chiudi', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/admin/bookings']);
        },
        error: (err) => {
          console.error('Errore durante l\'eliminazione:', err);
          this.errorMessage = err.error?.detail || 'Errore durante l\'eliminazione';
          this.isLoading = false;
          this.showDeleteConfirm = false;
        }
      });
    } catch (error) {
      console.error('Errore di validazione:', error);
      this.errorMessage = error instanceof Error ? error.message : 'Errore di validazione';
      this.isLoading = false;
    }
  }

  getMotivazioneLabel(motivazione: string | null | undefined): string {
    if (!motivazione) return 'Non specificato';
    // Cerca il valore nell'enum
    const enumValue = Object.values(MotivazioneEnum).find(
      value => value === motivazione
    );
    // Se trovato, restituisce la label corrispondente
    if (enumValue) {
      return MotivazioniUpdateLabels[enumValue];
    }
    console.warn('Motivazione non riconosciuta:', motivazione);
    return motivazione;
  }

  onCancel(): void {
    this.router.navigate(['/admin/bookings']);
  }

  getMotivazioneDeleteLabel(motivazione: string | null | undefined): string {
    if (!motivazione) return 'Non specificato';
    const enumValue = Object.values(MotivazioneDeleteEnum).find(
      value => value === motivazione
    );
    if (enumValue) {
      return MotivazioniDeleteLabels[enumValue];
    }
    console.warn('Motivazione di cancellazione non riconosciuta:', motivazione);
    return motivazione; // Fallback: mostra il valore originale
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.deleteForm.reset();
  }
}
