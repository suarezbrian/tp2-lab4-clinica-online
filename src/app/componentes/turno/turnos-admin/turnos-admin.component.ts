import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-turnos-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './turnos-admin.component.html',
  styleUrl: './turnos-admin.component.css'
})
export class TurnosAdminComponent {
  turnos = [
    {
      especialidad: 'Cardiología',
      especialista: 'Dr. Juan Pérez',
      fecha: '20/06/2024',
      estado: 'Pendiente',
      comentarioCancelacion: ''
    },
    {
      especialidad: 'Dermatología',
      especialista: 'Dra. María Gómez',
      fecha: '25/06/2024',
      estado: 'Confirmado',
      comentarioCancelacion: ''
    },
    
  ];

  constructor(){}

  cancelarTurno(turno: any) {
    const comentario = prompt('Ingrese un comentario para cancelar el turno:');
    if (comentario) {
      turno.estado = 'Cancelado';
      turno.comentarioCancelacion = comentario;
      alert('Turno cancelado con comentario: ' + comentario);
    }
  }
}
