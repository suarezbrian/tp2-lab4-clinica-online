import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedServiceService } from '../../services/shared-service.service';
import { Subscription } from 'rxjs';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { PacienteService } from '../../services/paciente.service';
import { HistoriaClinica } from '../../interfaces/historia-clinica';
import { AlertsService } from '../../services/alerts.service';
import { TurnosService } from '../../services/turnos.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-historia-clinica',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatError],
  templateUrl: './historia-clinica.component.html',
  styleUrl: './historia-clinica.component.css'
})
export class HistoriaClinicaComponent {
  @Input() turnoSeleccionado: any;

  historiaClinicaForm: FormGroup;
  mostrarHistoriaClinica = false;
  private subscription!: Subscription;

  constructor(private fb: FormBuilder, private sharedService: SharedServiceService, 
    private pacienteService:PacienteService, private alerts:AlertsService, private turnoService: TurnosService,
    private router: Router) {
    this.historiaClinicaForm = this.fb.group({
      altura: ['', Validators.required],
      peso: ['', Validators.required],
      temperatura: ['', Validators.required],
      presion: ['', Validators.required],
      datosDinamicos: this.fb.array([]) 
    });    
  }
  
  ngOnInit(){
    this.subscription = this.sharedService.mostrarHistoriaClinica$.subscribe(
      mostrar => this.mostrarHistoriaClinica = mostrar
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  get datosDinamicos() {
    return this.historiaClinicaForm.get('datosDinamicos') as FormArray;
  }

  agregarCampo() {
    if (this.datosDinamicos.length < 3) {
      this.datosDinamicos.push(this.fb.group({
        clave: ['', Validators.required],
        valor: ['', Validators.required]
      }));
    }
  }

  eliminarCampo(index: number) {
    this.datosDinamicos.removeAt(index);
  }

  cerrarModal() {
    this.sharedService.mostrarHistoriaClinica = false; 
    this.mostrarHistoriaClinica = this.sharedService.mostrarHistoriaClinica;
  }

  async guardarHistoriaClinica() {
    if (this.historiaClinicaForm.valid) {
      
      let historiaClinicaNuevo: HistoriaClinica = {
        altura: this.historiaClinicaForm.get('altura')?.value,
        peso: this.historiaClinicaForm.get('peso')?.value,
        temperatura: this.historiaClinicaForm.get('temperatura')?.value,
        presion: this.historiaClinicaForm.get('presion')?.value,
        datosDinamicos: this.datosDinamicos.value,
        fecha: new Date(),
        Especialista: this.turnoSeleccionado.especialista
      }

      const camposActualizar = {
        historiaClinicaCargada: true,
        historiaClinica: historiaClinicaNuevo
      };

      await this.turnoService.actualizarTurno(this.turnoSeleccionado.especialista.email, this.turnoSeleccionado.fecha, this.turnoSeleccionado.hora, this.turnoSeleccionado.estado, camposActualizar);
      //await this.pacienteService.agregarHistoriaClinica("usuarios", "email", this.turnoSeleccionado.paciente.email, historiaClinicaNuevo);
      this.sharedService.triggerCargarTurnos();
      this.cerrarModal();
    } else {
      this.alerts.mostrarAlerta(false, "El detalle del turno no esta completo.", 2000);
    }
  }
}
