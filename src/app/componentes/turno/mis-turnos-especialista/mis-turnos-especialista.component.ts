import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-mis-turnos-especialista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-turnos-especialista.component.html',
  styleUrl: './mis-turnos-especialista.component.css'
})
export class MisTurnosEspecialistaComponent {
  turnos = [
    {
      especialidad: 'Cardiología',
      paciente: 'Juan Pérez',
      fecha: '20/06/2024',
      estado: 'Pendiente'
    },
    {
      especialidad: 'Dermatología',
      paciente: 'María Gómez',
      fecha: '25/06/2024',
      estado: 'Confirmado'
    },
   
  ];
  
  constructor(){

  }

  cancelarTurno(turno: any) {
    alert('Turno cancelado');
  }

  rechazarTurno(turno: any) {
    alert('Turno rechazado');
  }

  aceptarTurno(turno: any) {
    alert('Turno aceptado');
  }

  finalizarTurno(turno: any) {
    alert('Turno finalizado');
  }

  verResena(turno: any) {
    alert('Ver reseña');
  }
}
