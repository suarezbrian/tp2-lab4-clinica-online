import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TurnosService } from '../../../services/turnos.service';
import { Turno } from '../../../interfaces/turno';
import { FormsModule } from '@angular/forms';
import { AlertsService } from '../../../services/alerts.service';
import { EstadoTurno } from "../../../interfaces/estado-turno";
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-mis-turnos-especialista',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIcon],
  templateUrl: './mis-turnos-especialista.component.html',
  styleUrl: './mis-turnos-especialista.component.css'
})
export class MisTurnosEspecialistaComponent {
  @Input() datosUsuario: any;

  turnos: any[] = [];
  estadoTurno = EstadoTurno;
  mostrarComentario: boolean = false;
  turnosFiltrados: Turno[] = [];
  filtroEspecialidad: string = '';
  filtroPaciente: string = '';

  constructor(private turnoService: TurnosService, private alertService: AlertsService) {}

  async ngOnInit() {
    this.turnos = await this.turnoService.obtenerTurnos(this.datosUsuario.email);
    this.turnosFiltrados = this.turnos;

  }

  filtrarTurnosEspecialidad() {
    if (this.filtroEspecialidad.trim() === '') {
      this.turnosFiltrados = this.turnos;
    } else {
      this.turnosFiltrados = this.turnos.filter(turno =>
        turno.especialidad.toLowerCase().startsWith(this.filtroEspecialidad.toLowerCase())
      );
    }
  }  
    
  filtrarTurnosPaciente() {
    if (this.filtroPaciente.trim() === '') {
      this.turnosFiltrados = this.turnos;
    } else {
      this.turnosFiltrados = this.turnos.filter(turno =>
        turno.paciente.nombre.toLowerCase().startsWith(this.filtroPaciente.toLowerCase())
      );
    }
  }


  async cancelarTurno(turno: Turno): Promise<void> {
    const comentario = await this.alertService.mostrarAlertaConInput("Motivos por el cual se desea cancelar el turno.", "Escribir los motivos...", "Cancelar Turno.","Turno cancelado con exito.");
    if (comentario) {
      const camposActualizar = {
        estado: EstadoTurno.Cancelado,
        comentarioCancelar: comentario
      };
      try {
        await this.turnoService.actualizarTurno(turno.especialista.email, turno.fecha, turno.hora, turno.estado, camposActualizar);
        turno.estado = EstadoTurno.Cancelado;
        turno.comentarioCancelar = comentario
      } catch (error) {
        this.alertService.mostrarAlerta(false, 'Error al cancelar el turno:', 2000);
      }
    } else {
      this.alertService.mostrarAlerta(false, "Debe ingresar un comentario para cancelar el turno.", 2000);
    }
  }

  async rechazarTurno(turno: Turno): Promise<void> {
    const comentario = await this.alertService.mostrarAlertaConInput("Motivos por el cual se desea rechazar el turno.", "Escribir los motivos...", "Rechazar Turno.", "Turno rechazado con exito.");

    if (comentario) {
      const camposActualizar = {
        estado: EstadoTurno.Rechazado,
        comentarioRechazar: comentario
      };
      try {
        await this.turnoService.actualizarTurno(turno.especialista.email, turno.fecha, turno.hora, turno.estado, camposActualizar);
        turno.estado = EstadoTurno.Rechazado;
        turno.comentarioRechazar = comentario;
      } catch (error) {
        this.alertService.mostrarAlerta(false, 'Error al rechazar el turno:', 2000);
      }
    } else {
      this.alertService.mostrarAlerta(false, "Debe ingresar un comentario para rechazar el turno.", 2000);
    }
  }

  async aceptarTurno(turno: Turno): Promise<void> {
    const camposActualizar = {
      estado: EstadoTurno.Confirmado
    };
    try {
      await this.turnoService.actualizarTurno(turno.especialista.email, turno.fecha, turno.hora, turno.estado, camposActualizar);
      turno.estado = EstadoTurno.Confirmado;
    } catch (error) {
      this.alertService.mostrarAlerta(false, 'Error al aceptar el turno:', 2000);
    }
  }

  async finalizarTurno(turno: Turno): Promise<void> {
    const comentario = await this.alertService.mostrarAlertaConInput("Comentario para finalizar el turno.", "Escribir los comentarios...", "Finalizar Turno.", "Turno finalizado con exito.");

    if (comentario) {
      const camposActualizar = {
        estado: EstadoTurno.Finalizado,
        comentario: comentario
      };
      try {
        await this.turnoService.actualizarTurno(turno.especialista.email, turno.fecha, turno.hora, turno.estado, camposActualizar);
        turno.estado = EstadoTurno.Finalizado;
        turno.comentario = comentario;
      } catch (error) {
        this.alertService.mostrarAlerta(false, 'Error al finalizar el turno:', 2000);
      }
    } else {
      this.alertService.mostrarAlerta(false, "Debe ingresar una reseña o comentario para finalizar el turno.", 2000);
    }
  }

  verComentario(turno: Turno): void {
    this.mostrarComentario == true ? this.mostrarComentario = false: this.mostrarComentario = true;
  }
}
