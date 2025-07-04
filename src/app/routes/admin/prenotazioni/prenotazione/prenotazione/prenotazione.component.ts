// prenotazione.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { lastValueFrom, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PrenotazioniService } from '../../../../../service/dao/dao_prenotazioni.service';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { MotivazioneDeleteEnum, MotivazioniDelete, MotivazioniDeleteLabels } from '../../../../../model/enums/motivazione_delete_enum';
import { MotivazioneEnum, MotivazioniUpdate, MotivazioniUpdateLabels } from '../../../../../model/enums/motivazione_enum';
import { DeletePrenotazioneDTO } from '../../../../../model/dto/delete_prenotazione_dto';
import { differenceInHours, isBefore, parseISO } from 'date-fns';
import { ErrorTypes } from '../../../../../model/enums/errori_enum';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Prenotazione } from '../../../../../model/prenotazione';

@Component({
  selector: 'app-edit-prenotazione',
  templateUrl: './prenotazione.component.html',
  styleUrls: ['./prenotazione.component.scss'],
  imports: [
    MatInputModule,
    MatFormFieldModule,
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  standalone: true
})
export class PrenotazioneComponent implements OnInit {
  prenotazioneForm!: FormGroup;
  deleteForm!: FormGroup;
  idPrenotazione: number | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  showDeleteConfirm = false;
  motivazioniDelete = MotivazioniDelete;
  motivazioniModify = MotivazioniUpdate;
  dataPrenotazioneInizio: Date | string | null = null;
  timeSlots: { label: string, value: string }[] = [];
  minDate: Date;
  prenotazione?: Prenotazione;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private prenotazioniService: PrenotazioniService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.minDate = new Date();
    this.initializeTimeSlots();
    this.createForm();
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

  private initializeTimeSlots(): void {
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const hourStr = hour.toString().padStart(2, '0');
        const minuteStr = minute.toString().padStart(2, '0');
        this.timeSlots.push({
          label: `${hourStr}:${minuteStr}`,
          value: `${hourStr}:${minuteStr}`
        });
      }
    }
  }

  private createForm(): void {
    // CORREZIONE: Usa arrow function per preservare il contesto di 'this'
    const dateTimeValidator = (control: AbstractControl): { [key: string]: boolean } | null => {
      const startDate = control.get('data_inizio')?.value;
      const startTime = control.get('ora_inizio')?.value;
      const endDate = control.get('data_fine')?.value;
      const endTime = control.get('ora_fine')?.value;

      if (!startDate || !startTime || !endDate || !endTime) {
        return null;
      }

      const start = this.combineDateTime(startDate, startTime);
      const end = this.combineDateTime(endDate, endTime);

      if (start >= end) {
        return { invalidRange: true };
      }

      return null;
    };

    this.prenotazioneForm = this.fb.group({
      data_inizio: ['', Validators.required],
      ora_inizio: ['', Validators.required],
      data_fine: ['', Validators.required],
      ora_fine: ['', Validators.required],
      id_sala: ['', [Validators.required, Validators.min(1)]],
      motivazione: [{ value: '', disabled: false }, Validators.required]
    }, { validators: dateTimeValidator }); // Usa la funzione locale

    this.deleteForm = this.fb.group({
      motivazione: ['', Validators.required],
      note_aggiuntive: ['']
    });
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
      next: (prenotazioneData) => {
        try {
          this.prenotazione = prenotazioneData;
          this.dataPrenotazioneInizio = prenotazioneData.data_ora_inizio;
          const inizioDate = new Date(prenotazioneData.data_ora_inizio);
          const fineDate = new Date(prenotazioneData.data_ora_fine);

          const motivazione = this.motivazioniModify.find(m => m.value === prenotazioneData.motivazione);

          this.prenotazioneForm.patchValue({
            data_inizio: inizioDate,
            ora_inizio: this.formatTime(inizioDate),
            data_fine: fineDate,
            ora_fine: this.formatTime(fineDate),
            id_sala: prenotazioneData.id_sala,
            motivazione: motivazione ? motivazione.value : prenotazioneData.motivazione || ''
          });
        } catch (e) {
          console.error('Errore nel formato dei dati ricevuti:', e);
          this.errorMessage = 'Errore nel formato dei dati ricevuti';
        }
        this.isLoading = false;
      }
    });
  }

  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // CORREZIONE: Rendi il metodo pubblico o mantieni privato ma assicurati sia accessibile
  private combineDateTime(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  }

  private validatePrenotazioneModificabile(dataOraInizio: string | Date): void {
    const now = new Date();
    const inizio = typeof dataOraInizio === 'string' ? parseISO(dataOraInizio) : dataOraInizio;

    if (isNaN(inizio.getTime())) {
      throw new Error('Data di inizio non valida');
    }

    if (isBefore(inizio, now)) {
      throw new Error('Impossibile completare l\'operazione: la data della prenotazione è già trascorsa.');
    }

    const hoursDifference = differenceInHours(inizio, now);

    if (hoursDifference < 48) {
      throw new Error('L\'operazione è consentita solo se mancano almeno 48 ore all\'orario di inizio.');
    }
  }

  onSubmit(): void {
    if (!this.prenotazioneForm.valid || !this.idPrenotazione || !this.prenotazione) return;

    try {
      const startDateTime = this.combineDateTime(
        this.prenotazioneForm.value.data_inizio,
        this.prenotazioneForm.value.ora_inizio
      );

      const endDateTime = this.combineDateTime(
        this.prenotazioneForm.value.data_fine,
        this.prenotazioneForm.value.ora_fine
      );

      this.validatePrenotazioneModificabile(startDateTime);

      this.isLoading = true;
      this.errorMessage = null;

      const payload: Prenotazione = {
        ...this.prenotazione,
        data_ora_inizio: this.formatDateForBackend(startDateTime),
        data_ora_fine: this.formatDateForBackend(endDateTime),
        id_sala: this.prenotazioneForm.value.id_sala,
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

  private formatDateForBackend(date: Date): string {
    if (isNaN(date.getTime())) throw new Error('Invalid date');
    return date.toISOString().split('.')[0];
  }

  private handleModifyError(err: any): void {
    console.error('Errore durante la modifica:', err);

    let errorMessage = 'Errore durante la modifica della prenotazione';
    const errorDetail = err?.error?.detail;

    if (typeof errorDetail === 'string') {
      const cleanMessage = errorDetail.replace(/^\d+\s*:\s*/, '').trim();

      switch (true) {
        case cleanMessage.includes(ErrorTypes.SALA_NOT_FOUND):
          errorMessage = 'La sala selezionata non esiste';
          this.prenotazioneForm.get('id_sala')?.setErrors({ notFound: true });
          break;
        case cleanMessage.includes(ErrorTypes.INVALID_DATE_RANGE):
          errorMessage = 'Le date inserite non sono valide: la data di fine deve essere successiva alla data di inizio';
          this.prenotazioneForm.get('data_inizio')?.setErrors({ invalidRange: true });
          this.prenotazioneForm.get('data_fine')?.setErrors({ invalidRange: true });
          break;
        default:
          errorMessage = cleanMessage;
      }
    } else if (errorDetail && typeof errorDetail === 'object') {
      if (errorDetail.type === 'invalid_date_range') {
        errorMessage = 'Le date inserite non sono valide';
        this.prenotazioneForm.get('data_inizio')?.setErrors({ invalidRange: true });
        this.prenotazioneForm.get('data_fine')?.setErrors({ invalidRange: true });
      } else {
        errorMessage = errorDetail.message || errorMessage;
      }
    }

    this.errorMessage = errorMessage;
    this.isLoading = false;
  }

  async confirmDelete(): Promise<void> {
    try {
      if (!this.idPrenotazione || this.deleteForm.invalid) {
        throw new Error('Dati mancanti o non validi');
      }

      if (!this.dataPrenotazioneInizio) {
        throw new Error('Impossibile trovare la data di inizio della prenotazione');
      }

      this.validatePrenotazioneModificabile(this.dataPrenotazioneInizio);

      this.isLoading = true;

      const deleteRequest: DeletePrenotazioneDTO = {
        motivazione: this.deleteForm.value.motivazione,
        note_aggiuntive: this.deleteForm.value.note_aggiuntive || null
      };

      await lastValueFrom(
        this.prenotazioniService.deletePrenotazione(this.idPrenotazione, deleteRequest)
      );

      this.snackBar.open('Prenotazione eliminata con successo', 'Chiudi', {
        duration: 5000,
        panelClass: ['success-snackbar']
      });

      this.router.navigate(['/admin/bookings']);
    } catch (error) {
      console.error('Errore durante l\'eliminazione:', error);
      this.errorMessage = this.getErrorMessage(error);
      this.snackBar.open(this.errorMessage, 'Chiudi', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isLoading = false;
      this.showDeleteConfirm = false;
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Errore durante l\'operazione';
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
    return motivazione;
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.deleteForm.reset();
  }
}
