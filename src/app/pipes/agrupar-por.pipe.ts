import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'agruparPor',
  standalone: true
})
export class AgruparPorPipe implements PipeTransform {

  transform(items: any[], key: string): any {
    if (!items || !key) {
      return [];
    }

    const groupedBy = items.reduce((acc, item) => {
      const groupKey = item[key];
      if (!acc[groupKey]) {
        acc[groupKey] = 0;
      }
      acc[groupKey]++;
      return acc;
    }, {});

    const labels = Object.keys(groupedBy);
    const data = {
      labels: labels,
      datasets: [{
        label: `Ingresos al sistema por ${key}`,
        data: labels.map(label => groupedBy[label]),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    };

    return data;
  }

}
