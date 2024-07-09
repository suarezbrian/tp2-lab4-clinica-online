import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { TurnosService } from '../../services/turnos.service';
import { SharedServiceService } from '../../services/shared-service.service';
import { EstadoTurno } from '../../interfaces/estado-turno';
import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'app-paciente-esp',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIcon, SpinnerComponent, ReactiveFormsModule],
  templateUrl: './paciente-esp.component.html',
  styleUrl: './paciente-esp.component.css'
})
export class PacienteEspComponent {
  pacienteSeleccionado: any | null = null;
  pacientes: any;
  datosUsuario: any;
  estadoTurno = EstadoTurno;
  isLoading = true;
  mostrarHistoriaClinicaDisable: boolean = false;
  turnoSeleccionadoHistoria: any;
  historiaClinicaForm!: FormGroup;

  constructor(private turnoService: TurnosService, private sharedService: SharedServiceService, private fb: FormBuilder) {
    this.historiaClinicaForm = this.fb.group({
      altura: ['', Validators.required],
      peso: ['', Validators.required],
      temperatura: ['', Validators.required],
      presion: ['', Validators.required],
      datosDinamicos: this.fb.array([])
    });
   }

  async ngOnInit(){
    this.sharedService.estadoCompartido$.subscribe(estado => {
      this.datosUsuario = estado.usuarioLogeado;      
    });
    await this.obtenerYOrdenarTurnos(this.datosUsuario.email);
    this.isLoading = false;
    
  }

  async obtenerYOrdenarTurnos(especialistaEmail: string) {
    try {
      const turnosPorPaciente = await this.turnoService.obtenerTurnosPorPaciente(especialistaEmail);
      
      this.pacientes = Array.from(turnosPorPaciente.values());
    
      if(this.pacientes.length > 0){
        this.pacienteSeleccionado = this.pacientes[0];
      }

      console.log('Turnos ordenados por paciente:', this.pacientes);
    } catch (error) {
      console.error('Error al obtener y ordenar los turnos:', error);
    }
  }

  seleccionarPaciente(paciente: any): void {
    this.pacienteSeleccionado = paciente;
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

  cerrarModal() {
     this.mostrarHistoriaClinicaDisable = false;
  }
}
