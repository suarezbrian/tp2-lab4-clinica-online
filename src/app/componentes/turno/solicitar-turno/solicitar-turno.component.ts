import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {MatStepperModule} from '@angular/material/stepper';
import { UsuarioService } from '../../../services/usuario.service';
import { SharedServiceService } from '../../../services/shared-service.service';
import { Turno } from '../../../interfaces/turno';
import { SpinnerComponent } from '../../spinner/spinner.component';
import { TurnosService } from '../../../services/turnos.service';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-solicitar-turno',
  standalone: true,
  imports: [CommonModule,FormsModule, ReactiveFormsModule,MatStepperModule, SpinnerComponent, MatIcon, MatTooltip, MatButton],
  templateUrl: './solicitar-turno.component.html',
  styleUrl: './solicitar-turno.component.css'
})
export class SolicitarTurnoComponent {

 
  especialidadForm!: FormGroup;
  especialistaForm!: FormGroup;
  diaForm!: FormGroup;
  horarioForm!: FormGroup;
  estaLogeado: boolean = false;
  pacienteLogeado: any;
  especialistas: any[]=[];
  diasDisponibles: any[]=[];
  horariosDisponibles: any[]=[];
  especialidades: any[]=[];
  isLoading = true;
  turnosNoDisponibles: any[]=[];
  defaultImage = 'assets/default.png';
  especialistaSeleccionado: any; 
  especialidadSeleccionada: any; 
  diaSeleccionado!: Date; 
  horarioSeleccionado!: string; 

  constructor(private fb: FormBuilder, private usuarioService:UsuarioService, private sharedService: SharedServiceService, private turnoService: TurnosService) {
    this.especialidadForm = this.fb.group({
      especialidad: ['', Validators.required]
    });    
    this.especialistaForm = this.fb.group({
      especialista: ['', Validators.required]
    });    
    this.diaForm = this.fb.group({
      formatoDia: ['', Validators.required]
    });    
    this.horarioForm = this.fb.group({
      horario: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.sharedService.estadoCompartido$.subscribe(estado => {
      this.estaLogeado = estado.estaLogeado;
      this.pacienteLogeado = estado.usuarioLogeado;
    });
  
    // Obtener especialidades.
    this.usuarioService.obtenerCollection('especialidad').subscribe({
      next: (especialidades: any[]) => {

        this.especialidades = especialidades;
    
        Promise.all(especialidades.map(especialidad => this.obtenerEspecialidadConImagenes(especialidad)))
          .then((resultados) => {
            resultados.forEach((especialidadConImagenes, index) => {

              this.especialidades[index] = especialidadConImagenes;
            });
    
            Promise.all(this.especialidades.map(especialidad => this.obtenerEspecialistasConImagenes(especialidad)))
              .then((resultados) => {
                resultados.forEach((especialistasConImagenes, index) => {
                  this.especialidades[index].especialistas = especialistasConImagenes;
                });
                
                this.especialidades = this.especialidades.filter(especialidad => especialidad.especialistas && especialidad.especialistas.length > 0);
                console.log('Especialidades con al menos un especialista:', this.especialidades);
              })
              .catch((error) => {
                console.error('Error al obtener imágenes de especialistas:', error);
              })
              .finally(() => {
                this.isLoading = false;
              });
          })
          .catch((error) => {
            console.error('Error al obtener imágenes de especialidades:', error);
          });
      },
      error: (error) => {
        console.error('Error al obtener especialidades:', error);
      }
    });
  }
  
  async obtenerEspecialidadConImagenes(especialidad: any) {
    try {
      especialidad.rutaIcono = await this.usuarioService.obtenerImagen(especialidad.rutaIcono);
      return especialidad;
    } catch (error) {
      console.error(`Error al obtener imagen para la especialidad ${especialidad.id}:`, error);
      throw error;
    }
  }
  
  async obtenerEspecialistasConImagenes(especialidad: any) {
    try {
      const especialistas = await this.usuarioService.buscarVariosDatosPorCampo('usuarios', 'especialidad', especialidad.nombre);
      return await Promise.all(especialistas.map(async (especialista) => {
        especialista.rutaArchivoUno = await this.usuarioService.obtenerImagen(especialista.rutaArchivoUno);
        return especialista;
      }));
    } catch (error) {
      console.error(`Error al obtener especialistas para la especialidad ${especialidad.id}:`, error);
      throw error;
    }
  }

  selectEspecialidad(especialidad: any) {
    this.especialidadSeleccionada = especialidad;
    this.especialidadForm.patchValue({ especialidad: especialidad.nombre });
    this.loadEspecialistas(especialidad);
  }

  selectEspecialista(especialista: any) {
    this.especialistaSeleccionado = especialista;
    this.especialistaForm.patchValue({ especialista: especialista });
    this.loadDiasDisponibles(especialista);
  }

  selectDia(dia: Date) {
    this.diaSeleccionado = dia;
    const formatoDia = this.formatDateToDayMonth(dia);
    this.diaForm.patchValue({ formatoDia });  
    this.loadHorariosDisponibles();
  }

  selectHorario(horario: string) {
    this.horarioSeleccionado = horario;
    this.horarioForm.patchValue({ horario });
  }

  loadEspecialistas(especialidad: any) {
    this.especialistas = especialidad.especialistas;
  }

  async loadDiasDisponibles(especialista: any) {
    this.turnosNoDisponibles = await this.turnoService.buscarTurnos(especialista.email);
    this.diasDisponibles = this.calculateDiasDisponibles(especialista.disponibilidadHoraria);
  }

  loadHorariosDisponibles() {
    const especialista = this.especialistas.find(e => e.nombre === this.especialistaForm.value.especialista.nombre);
    if (especialista) {
      this.horariosDisponibles = this.calculateHorariosDisponibles(especialista.disponibilidadHoraria);
    }
  }

  calculateDiasDisponibles(disponibilidadHoraria: any) {
    const today = new Date();
    const diasDisponibles = [];
    const diaInicio = this.getDayNumber(disponibilidadHoraria.diaInicio);
    const diaFin = this.getDayNumber(disponibilidadHoraria.diaFin);
  
    for (let i = 1; i <= 15; i++) {
      const dia = new Date(today);
      dia.setDate(today.getDate() + i);
  
      const diaSemana = dia.getDay();
      const fechaFormato = this.formatDate(dia);
  
      const turnoOcupado = this.turnosNoDisponibles.find(turno => {
        return turno.fecha.includes(fechaFormato); 
      });
  
      if (!turnoOcupado) {
        if (diaInicio <= diaFin) {
          if (diaSemana >= diaInicio && diaSemana <= diaFin) {
            diasDisponibles.push(dia);
          }
        } else {
          if (diaSemana >= diaInicio || diaSemana <= diaFin) {
            diasDisponibles.push(dia);
          }
        }
      }
    }
  
    return diasDisponibles;
  }
  
  calculateHorariosDisponibles(disponibilidadHoraria: any) {
    const horariosDisponibles = [];
    const [horaInicio, minutoInicio] = disponibilidadHoraria.horaInicio.split(':').map((v: string) => parseInt(v));
    const [horaFin, minutoFin] = disponibilidadHoraria.horaFin.split(':').map((v: string) => parseInt(v));
  
    let currentHora = horaInicio;
    let currentMinuto = minutoInicio;
  
    while (currentHora < horaFin || (currentHora === horaFin && currentMinuto <= minutoFin)) {
      const horaFormato = this.formatTime(currentHora, currentMinuto);
  
      const turnoOcupado = this.turnosNoDisponibles.find(turno => {
        const fechaFormato = turno.fecha; 
        return fechaFormato === turno.fecha && turno.hora === horaFormato; 
      });
  
      if (!turnoOcupado) {
        horariosDisponibles.push(horaFormato);
      }
  
      currentMinuto += 30;
      if (currentMinuto >= 60) {
        currentHora += 1;
        currentMinuto = 0;
      }
    }
  
    return horariosDisponibles;
  }
  
  formatTime(hour: number, minute: number): string {
    return `${this.padTime(hour)}:${this.padTime(minute)}`;
  }
  
  padTime(time: number): string {
    return time.toString().padStart(2, '0');
  }
  
  formatDate(date: Date): string {
    console.log(date);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `(${day}/${month})`;
  }

  getDayNumber(dayName: string) {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days.indexOf(dayName);
  }

  formatDateToDayMonth(date: Date): string {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `(${day}/${month})`;
  }

  submit() {
    if (this.horarioForm.valid) {
      this.especialistaForm.value.especialista.rutaArchivoUno = "";
      const turno: Turno = {
        especialidad: this.especialidadForm.value.especialidad,
        especialista: this.especialistaForm.value.especialista,
        paciente: this.pacienteLogeado,
        fecha: this.diaForm.value.formatoDia,
        hora:  this.horarioForm.value.horario,
        estado: 1, 
        comentario: '',
        calificacion: { estrellas: 0, comentario: '' }
      };

      console.log('Turno confirmado:', turno);
      this.turnoService.guardarTurno(turno);
      
    }
  }


}
