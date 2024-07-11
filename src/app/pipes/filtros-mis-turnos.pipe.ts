import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtrosMisTurnos',
  standalone: true
})
export class FiltrosMisTurnosPipe implements PipeTransform {

  transform(turnos: any[], filtroEspecialidad: string, tipoFiltroEspecialidad: string, filtroEspecialista: string, tipoFiltroEspecialista: string): any[] {
    if (!turnos) {
      return [];
    }

    let turnosFiltrados = turnos;

    if (filtroEspecialidad && filtroEspecialidad.trim() !== '') {
      filtroEspecialidad = filtroEspecialidad.toLowerCase().trim();
      turnosFiltrados = turnosFiltrados.filter(turno => {
        return turno[tipoFiltroEspecialidad].toLowerCase().includes(filtroEspecialidad);
      });
    }

    if (filtroEspecialista && filtroEspecialista.trim() !== '') {
      filtroEspecialista = filtroEspecialista.toLowerCase().trim();
      turnosFiltrados = turnosFiltrados.filter(turno => {
        return turno[tipoFiltroEspecialista].toLowerCase().includes(filtroEspecialista);
      });
    }

    return turnosFiltrados;
  }

}
