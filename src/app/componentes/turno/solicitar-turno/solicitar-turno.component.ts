import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {MatStepper, MatStepperModule} from '@angular/material/stepper';
import { UsuarioService } from '../../../services/usuario.service';
import { SharedServiceService } from '../../../services/shared-service.service';
import { Turno } from '../../../interfaces/turno';
import { SpinnerComponent } from '../../spinner/spinner.component';
import { TurnosService } from '../../../services/turnos.service';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { EstadoTurno } from "../../../interfaces/estado-turno";
import { Router } from '@angular/router';
import { ConvertirFechaDiaMesPipe } from '../../../pipes/convertir-fecha-dia-mes.pipe';

@Component({
  selector: 'app-solicitar-turno',
  standalone: true,
  imports: [CommonModule,FormsModule, ReactiveFormsModule,MatStepperModule, SpinnerComponent, MatIcon, MatTooltip, MatButton, ConvertirFechaDiaMesPipe],
  templateUrl: './solicitar-turno.component.html',
  styleUrl: './solicitar-turno.component.css',
})
export class SolicitarTurnoComponent {
  @ViewChild('stepper') private stepper!: MatStepper;
 
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
  defaultImage = 'https://i.ibb.co/gTNF83N/f1d0807f8ffad0197757d840bdc97d0b-icono-de-registro-medico.webp';
  especialistaSeleccionado: any; 
  especialidadSeleccionada: any; 
  diaSeleccionado!: Date; 
  horarioSeleccionado!: string; 

  constructor(private fb: FormBuilder, private usuarioService:UsuarioService, private sharedService: SharedServiceService, private turnoService: TurnosService, private router: Router) {
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
      const especialistas = await this.usuarioService.buscarVariosDatosPorCampoArray('usuarios', 'especialidades', especialidad.nombre);
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
    this.stepper.next();
  }

  async selectEspecialista(especialista: any) {
    this.especialistaSeleccionado = especialista;
    this.especialistaForm.patchValue({ especialista: especialista });
    await this.loadDiasDisponibles(especialista);
    this.stepper.next();
  }

  selectDia(dia: Date) {
    this.diaSeleccionado = dia;
    const formatoDia = this.formatDateToDayMonth(dia);
    this.diaForm.patchValue({ formatoDia });  
    this.loadHorariosDisponibles();
    this.stepper.next();
  }

  selectHorario(horario: string) {
    this.horarioSeleccionado = horario;
    this.horarioForm.patchValue({ horario });
    this.stepper.next();
  }

  loadEspecialistas(especialidad: any) {
    this.especialistas = especialidad.especialistas;
  }

  async loadDiasDisponibles(especialista: any) {
    this.turnosNoDisponibles = await this.turnoService.buscarTurnos(especialista.email);
    console.log("turnos nos",this.turnosNoDisponibles);
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

  async submit() {
    if (this.horarioForm.valid) {
      this.especialistaForm.value.especialista.rutaArchivoUno = "";
      const turno: Turno = {
        especialidad: this.especialidadForm.value.especialidad,
        especialista: this.especialistaForm.value.especialista,
        paciente: this.pacienteLogeado,
        fecha: this.diaForm.value.formatoDia,
        hora:  this.horarioForm.value.horario,
        estado: EstadoTurno.Pendiente, 
        encuestaSatifaccion: {respueta1: false, respueta2: false, respuesta3:false, encuestaCompletada:false},
        comentario: '',
        calificacion: { estrellas: 0, comentario: '', calificacionHecha: false },
      };

      console.log('Turno confirmado:', turno);
      await this.turnoService.guardarTurno(turno);
      this.router.navigate(['/bienvenida']);
      
    }
  }

  onStepChange(event: any) {
    if (event.previouslySelectedIndex > event.selectedIndex) {
      this.resetFormsAndSelections(event.selectedIndex);
    }
  }

  resetFormsAndSelections(stepIndex: number) {
    switch (stepIndex) {
      case 0:
        this.especialidadForm.reset();
        break;
      case 1:
        this.especialistaForm.reset();
        break;
      case 2:
        this.diaForm.reset();
        break;
      case 3:
        this.horarioForm.reset();
        break;
    }
  }


}
