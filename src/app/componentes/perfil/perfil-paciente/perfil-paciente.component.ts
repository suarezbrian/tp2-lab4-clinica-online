import { Component, Input } from '@angular/core';
import { UsuarioService } from '../../../services/usuario.service';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TurnosService } from '../../../services/turnos.service';
import { EstadoTurno } from '../../../interfaces/estado-turno';

@Component({
  selector: 'app-perfil-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './perfil-paciente.component.html',
  styleUrl: './perfil-paciente.component.css'
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
  
}
