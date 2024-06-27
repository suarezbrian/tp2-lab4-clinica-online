import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './mis-turnos.component.html',
  styleUrl: './mis-turnos.component.css'
})
export class MisTurnosComponent {

  turnos = [
    {
      especialidad: 'Cardiología',
      especialista: 'Dr. Juan Pérez',
      fecha: '20/06/2024',
      estado: 'Confirmado'
    },
    {
      especialidad: 'Dermatología',
      especialista: 'Dra. María Gómez',
      fecha: '25/06/2024',
      estado: 'Pendiente'
    },
    // Agrega más turnos según sea necesario
  ];

  constructor(){}

  cancelarTurno(turno: any){

  }
  verResena(turno: any){
    
  }
  completarEncuesta(turno: any){

  }
  calificarAtencion(turno: any){

  }
}
