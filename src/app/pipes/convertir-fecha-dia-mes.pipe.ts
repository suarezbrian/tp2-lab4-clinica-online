import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'convertirFechaDiaMes',
  standalone: true
})
export class ConvertirFechaDiaMesPipe implements PipeTransform {

  transform(value: any): string {
    let date = value;
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `(${day}/${month})`;
  }

}
