import { Component, Input } from '@angular/core';
import { UsuarioService } from '../../../services/usuario.service';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TurnosService } from '../../../services/turnos.service';
import { EstadoTurno } from '../../../interfaces/estado-turno';
import jsPDF from 'jspdf';
import { fadeAnimation, salidaAnimation } from '../../../animations.component';

@Component({
  selector: 'app-perfil-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './perfil-paciente.component.html',
  styleUrl: './perfil-paciente.component.css',
  animations: [fadeAnimation, salidaAnimation]
})
export class PerfilPacienteComponent {
  @Input() datosPaciente: any;
  primeraImagen: any;
  segundaImagen: any;
  mostrarHistoria: boolean = false;
  turnos: any;
  estadoTurno = EstadoTurno;
  turnoSeleccionadoHistoria: any;
  mostrarHistoriaClinicaDisable: boolean = false;
  historiaClinicaForm!: FormGroup;



  constructor(private usuarioServices:UsuarioService, private turnoService: TurnosService, private fb: FormBuilder){  
    this.historiaClinicaForm = this.fb.group({
      altura: ['', Validators.required],
      peso: ['', Validators.required],
      temperatura: ['', Validators.required],
      presion: ['', Validators.required],
      datosDinamicos: this.fb.array([])
    });
  }

  async ngOnInit(){
    await this.guardarImagenes(this.datosPaciente);
    this.cargarTurnos();    
  }

  async cargarTurnos(){
    this.turnos = await this.turnoService.obtenerTurnosPaciente(this.datosPaciente.email);    
  }


  async guardarImagenes(usuarios: any) {   
    this.primeraImagen = await this.cargarImagenes(usuarios.rutaArchivoUno);
    this.segundaImagen = await this.cargarImagenes(usuarios.rutaArchivoDos);
  }


  async cargarImagenes(rutaCarpeta: string): Promise<string> {    
    try {
      const imagenes = await this.usuarioServices.obtenerImagen(rutaCarpeta);      
      return imagenes;
    } catch (error) {
      console.error('Error al cargar las imágenes:', error);
      throw error;
    }
  }

  mostrarHistoriaClinica(){
    this.mostrarHistoria == true ? this.mostrarHistoria = false: this.mostrarHistoria = true;
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
