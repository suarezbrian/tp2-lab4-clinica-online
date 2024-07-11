import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { TurnosService } from '../../services/turnos.service';
import { SharedServiceService } from '../../services/shared-service.service';
import { EstadoTurno } from '../../interfaces/estado-turno';
import { SpinnerComponent } from '../spinner/spinner.component';
import jsPDF from 'jspdf';
import { SelectPacienteDirective } from '../../directives/select-paciente.directive';

@Component({
  selector: 'app-paciente-esp',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIcon, SpinnerComponent, ReactiveFormsModule, SelectPacienteDirective],
  templateUrl: './paciente-esp.component.html',
  styleUrl: './paciente-esp.component.css',
  providers:[SelectPacienteDirective]
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

  async generarPDF(turno: any) {
    console.log(turno);
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
      doc.setFontSize(15);
      doc.text('Campos agregados:', 10, 210);
      turno.historiaClinica.datosDinamicos.forEach((campo: { clave: any; valor: any; }, index: number) => {
        doc.text(`${campo.clave}: ${campo.valor}`, 10, 220 + (index * 10));
      });
    }

    doc.save('historia_clinica.pdf');
  }
}
