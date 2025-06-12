import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of, throwError } from 'rxjs';
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
      motivazione: ['', [Validators.required, Validators.minLength(3)]]
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
          const motivazione = this.motivazioniModify.find(m => m.value === prenotazione.motivazione);
          this.prenotazioneForm.patchValue({
            data_ora_inizio: this.formatDateForInput(prenotazione.data_ora_inizio),
            data_ora_fine: this.formatDateForInput(prenotazione.data_ora_fine),
            id_sala: prenotazione.id_sala,
            motivazione: motivazione ? motivazione.value : prenotazione.motivazione || ''
          });
        } catch (e) {
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

  onSubmit(): void {
    if (!this.prenotazioneForm.valid || !this.idPrenotazione) return;
    console.log('Valori del form prima dell\'invio:', this.prenotazioneForm.value);
    this.isLoading = true;
    this.errorMessage = null;
    const motivazioneEnumValue: MotivazioneEnum = this.prenotazioneForm.value.motivazione;
    const formData = {
      ...this.prenotazioneForm.value,
      motivazione: motivazioneEnumValue,  // invia la chiave enum tecnica (es. "cambio_orario")
      data_ora_inizio: new Date(this.prenotazioneForm.value.data_ora_inizio),
      data_ora_fine: new Date(this.prenotazioneForm.value.data_ora_fine)
    };
    this.prenotazioniService.modificaPrenotazione(this.idPrenotazione, formData).subscribe({
      next: () => {
        this.snackBar.open('Prenotazione modificata con successo', 'Chiudi', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/admin/bookings']);
      },
      error: (err) => {
        this.errorMessage = err.error?.detail || 'Errore durante il salvataggio';
        this.isLoading = false;
      }
    });
  }

  confirmDelete() {
    if (!this.idPrenotazione || this.deleteForm.invalid) return;

    this.isLoading = true;

    const motivazioneEnumValue: MotivazioneDeleteEnum = this.deleteForm.value.motivazione;

    const deleteRequest: DeletePrenotazioneDTO = {
      motivazione: motivazioneEnumValue,  // invia la chiave enum!
      note_aggiuntive: this.deleteForm.value.note_aggiuntive
    };

    console.log('Richiesta delete:', deleteRequest);

    this.prenotazioniService.deletePrenotazione(this.idPrenotazione, deleteRequest).subscribe({
      next: (response) => {
        this.snackBar.open(`Prenotazione eliminata, 'delete')}`, 'Chiudi', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/admin/bookings']);
      },
      error: (err) => {
        this.errorMessage = err.error?.detail || 'Errore durante l\'eliminazione';
        this.isLoading = false;
        this.showDeleteConfirm = false;
      }
    });
  }


  private getLabel(value: string, type: 'modify' | 'delete'): string {
    const motivazioni = type === 'modify' ? this.motivazioniModify : this.motivazioniDelete;
    const motivo = motivazioni.find(m => m.value === value);
    return motivo ? motivo.label : value;
  }

  onCancel(): void {
    this.router.navigate(['/admin/bookings']);
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.deleteForm.reset();
  }
}
