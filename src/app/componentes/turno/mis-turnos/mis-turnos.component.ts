import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TurnosService } from '../../../services/turnos.service';
import { AlertsService } from '../../../services/alerts.service';
import { EstadoTurno } from "../../../interfaces/estado-turno";
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Turno } from '../../../interfaces/turno';
import { MatIcon } from '@angular/material/icon';
import jsPDF from 'jspdf';
import { UsuarioService } from '../../../services/usuario.service';
import { fadeAnimation, salidaAnimation } from '../../../animations.component';

@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, MatIcon, ReactiveFormsModule],
  templateUrl: './mis-turnos.component.html',
  styleUrl: './mis-turnos.component.css', 
  animations: [fadeAnimation, salidaAnimation]

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
  filtroDatos: string = "";

  constructor(private turnoService: TurnosService, private alertService: AlertsService, private fb: FormBuilder, private usuarioService:UsuarioService) {
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

  filtrarPorCamposHistoriaClinica() {
    if (this.filtroDatos.trim() === '') {
      this.turnosFiltrados = this.turnos; 
    } else {
      this.turnosFiltrados = this.turnos.filter(turno => {
        if (turno.historiaClinica) {
          let keys = Object.keys(turno.historiaClinica);
  
          for (let key of keys) {
            if (key !== 'Especialista' && key !== 'fecha') {
              let valor = turno.historiaClinica[key];
  
              if (typeof valor === 'string' || typeof valor === 'number') {

                if (typeof valor === 'string' && valor.toLowerCase().includes(this.filtroDatos.toLowerCase())) {
                }
                if (typeof valor === 'number' && valor.toString().includes(this.filtroDatos)) {
                  return true; 
                }
              } else if (Array.isArray(valor)) {

                for (let dato of valor) {
                  if (dato.valor.toLowerCase().includes(this.filtroDatos.toLowerCase()) || dato.clave.toLowerCase().includes(this.filtroDatos.toLowerCase())) {
                    return true; 
                  }
                }
              }
            }
          }
        }
        return false; 
      });
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

  async generarPDF(turno: any) {

    const doc = new jsPDF();

    doc.setLineWidth(2);
    doc.rect(2, 2, doc.internal.pageSize.width - 5, doc.internal.pageSize.height - 5);

    const imgData = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Cruz_Roja.svg/1200px-Cruz_Roja.svg.png'; 
    doc.addImage(imgData, 'PNG', 10, 10, 50, 50);

    doc.setFontSize(10);
    doc.text(`Fecha emisión : ${new Date}`, 70, 10);
    doc.setFontSize(25);
    doc.text('Historia Clínica', 80, 60);
    doc.setFontSize(18);
    doc.text("Clinica Online", 90, 70);

   
    doc.text("Datos Paciente", 10, 80);
    doc.setFontSize(15);
    doc.text(`Nombre: ${turno.paciente.nombre}`, 10, 90);
    doc.text(`Apellido: ${turno.paciente.apellido}`, 10, 100);
    doc.text(`Edad: ${turno.paciente.edad}`, 10, 110);
    doc.text(`Email: ${turno.paciente.email}`, 10, 120);

    doc.setFontSize(18);
    doc.text("Datos del turno", 10, 150);
    doc.setFontSize(15);
    doc.text(`Altura: ${turno.historiaClinica.altura} cm`, 10, 160);
    doc.text(`Peso: ${turno.historiaClinica.peso} kg`, 10, 170);
    doc.text(`Temperatura: ${turno.historiaClinica.temperatura} °C`, 10, 180);
    doc.text(`Presión: ${turno.historiaClinica.presion}`, 10, 190);

    doc.setFontSize(18);
    if (turno.historiaClinica.datosDinamicos.length > 0) {
      doc.text('Campos agregados:', 10, 210);
      turno.historiaClinica.datosDinamicos.forEach((campo: { clave: any; valor: any; }, index: number) => {
        doc.text(`${campo.clave}: ${campo.valor}`, 10, 220 + (index * 10));
      });
    }

    doc.save('historia_clinica.pdf');
  }
  

}
