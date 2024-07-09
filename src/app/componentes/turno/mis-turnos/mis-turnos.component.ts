import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TurnosService } from '../../../services/turnos.service';
import { AlertsService } from '../../../services/alerts.service';
import { EstadoTurno } from "../../../interfaces/estado-turno";
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Turno } from '../../../interfaces/turno';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, MatIcon, ReactiveFormsModule],
  templateUrl: './mis-turnos.component.html',
  styleUrl: './mis-turnos.component.css'
})
export class MisTurnosComponent {
  @Input() datosUsuario: any;
  turnos: any[] = [];
  estadoTurno = EstadoTurno;
  mostrarCalificacion = false;
  rating: number | null = null;
  comentarioCalificacion: string = '';
  turnoSeleccionado: any;
  mostrarComentario: boolean = false;
  mostrarEncuesta: boolean = false;
  respuesta1: boolean | null = null; 
  respuesta2: boolean | null = null;
  respuesta3: boolean | null = null;
  turnosFiltrados: Turno[] = [];
  filtroEspecialidad: string = '';
  filtroEspecialista: string = '';
  mostrarHistoriaClinicaDisable: boolean = false;
  turnoSeleccionadoHistoria: any;
  historiaClinicaForm!: FormGroup;

  constructor(private turnoService: TurnosService, private alertService: AlertsService, private fb: FormBuilder) {
    this.historiaClinicaForm = this.fb.group({
      altura: ['', Validators.required],
      peso: ['', Validators.required],
      temperatura: ['', Validators.required],
      presion: ['', Validators.required],
      datosDinamicos: this.fb.array([])
    });
  }

  async ngOnInit() {
    this.cargarTurnos();
  }

  async cargarTurnos(){
    this.turnos = await this.turnoService.obtenerTurnosPaciente(this.datosUsuario.email);
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
    
  filtrarTurnosEspecialista() {
    if (this.filtroEspecialista.trim() === '') {
      this.turnosFiltrados = this.turnos;
    } else {
      this.turnosFiltrados = this.turnos.filter(turno =>
        turno.especialista.nombre.toLowerCase().startsWith(this.filtroEspecialista.toLowerCase())
      );
    }
  }

  async cancelarTurno(turno: Turno): Promise<void> {
    const comentario = await this.alertService.mostrarAlertaConInput("Motivos por el cual se desea cancelar el turno.", "Escribir los motivos...", "Cancelar Turno." ,"Turno cancelado con exito.");
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

  calificarAtencion(turno: any) {
    this.turnoSeleccionado = turno;
    this.mostrarCalificacion = true;
  }
    
  cerrarModal() {
    this.mostrarCalificacion = false;
    this.rating = null; 
    this.comentarioCalificacion = ''; 
  }
  
  setRating(value: number) {
    this.rating = value;
  }
  
  async guardarCalificacion() {
    if (this.rating !== null && this.comentarioCalificacion.trim() !== '') {

      const camposActualizar = {
        calificacion:{  
          estrellas: this.rating,
          comentario: this.comentarioCalificacion,
          calificacionHecha: true
        }      
      };

      await this.turnoService.actualizarTurno(this.turnoSeleccionado.especialista.email, this.turnoSeleccionado.fecha, this.turnoSeleccionado.hora, this.turnoSeleccionado.estado, camposActualizar);
      this.cerrarModal();
      this.cargarTurnos();
    }
  }

  
  verResena(turno: any){
    this.mostrarComentario == true ? this.mostrarComentario = false : this.mostrarComentario = true;
  }
    
  abrirEncuesta(turno: any) {
    this.turnoSeleccionado = turno;
    this.mostrarEncuesta = true;
  }

  cerrarEncuesta() {
    this.mostrarEncuesta = false;
    this.respuesta1 = null;
    this.respuesta2 = null;
    this.respuesta3 = null;
  }

  async guardarEncuesta() {
    const camposActualizar = {
      encuestaSatifaccion:{  
        respuesta1: this.respuesta1,
        respuesta2: this.respuesta2,
        respuesta3: this.respuesta3,
        encuestaCompletada: true
      }      
    };
    await this.turnoService.actualizarTurno(this.turnoSeleccionado.especialista.email, this.turnoSeleccionado.fecha, this.turnoSeleccionado.hora, this.turnoSeleccionado.estado, camposActualizar);
    this.cerrarEncuesta();
    this.cargarTurnos();
  }


  verHistoriaClinica(turno: any){

    this.turnoSeleccionadoHistoria = turno;
    this.mostrarHistoriaClinicaDisable = true;

    this.historiaClinicaForm.patchValue({
      altura: this.turnoSeleccionadoHistoria.historiaClinica.altura,
      peso: this.turnoSeleccionadoHistoria.historiaClinica.peso,
      temperatura: this.turnoSeleccionadoHistoria.historiaClinica.temperatura,
      presion: this.turnoSeleccionadoHistoria.historiaClinica.presion,
    });
  
    if (this.turnoSeleccionadoHistoria.historiaClinica.datosDinamicos) {
      this.turnoSeleccionadoHistoria.historiaClinica.datosDinamicos.forEach((dato: any) => {
        this.agregarDatoDinamico(dato.clave, dato.valor);
      });
    }
  }

  agregarDatoDinamico(clave: string, valor: string) {

    if (!this.historiaClinicaForm) {
        return;  
    }
    const datosDinamicosFormArray = this.historiaClinicaForm.get('datosDinamicos') as FormArray;
    if (!datosDinamicosFormArray) {
        return;  
    }

    datosDinamicosFormArray.push(this.fb.group({
        clave: [clave],
        valor: [valor]
    }));
  }

  cerrarHistorialClinico() {
     this.mostrarHistoriaClinicaDisable = false;
  }
  

}
