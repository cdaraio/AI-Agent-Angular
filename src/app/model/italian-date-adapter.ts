// italian-date-adapter.ts
import { Injectable } from '@angular/core';
import { MAT_DATE_FORMATS, MatDateFormats, NativeDateAdapter } from '@angular/material/core';

const ITALIAN_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Injectable()
export class ItalianDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'DD/MM/YYYY') {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return super.format(date, displayFormat);
  }

  override getFirstDayOfWeek(): number {
    return 1; // Lunedì come primo giorno della settimana
  }
}

export const ITALIAN_DATE_FORMATS_PROVIDER = {
  provide: MAT_DATE_FORMATS,
  useValue: ITALIAN_DATE_FORMATS,
};
