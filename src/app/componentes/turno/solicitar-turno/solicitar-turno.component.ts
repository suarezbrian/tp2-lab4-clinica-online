import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario.service';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-solicitar-turno',
  standalone: true,
  imports: [CommonModule,FormsModule, ReactiveFormsModule],
  templateUrl: './solicitar-turno.component.html',
  styleUrl: './solicitar-turno.component.css'
})
export class SolicitarTurnoComponent {

  formTurno!: FormGroup;
  especialidades: any;
  especialistas: any;
  pacientes: any;
  esAdmin = false;
  horasDisponibles!: string[];
  fechasDisponibles!: Date[];

  constructor(private turno: FormBuilder, private datosUsuario: UsuarioService){
    this.formTurno = this.turno.group({
      especialista: new FormControl("", [Validators.required]),
      especialidad: new FormControl("", [Validators.required]),
      hora: new FormControl("", [Validators.required]),
      fecha: new FormControl("", [Validators.required]),
      paciente: new FormControl("", [Validators.required])
    });
  }

  ngOnInit(){
    this.datosUsuario.obtenerCollection('especialidad').subscribe({
      next: (data: any[]) => {   
        this.especialidades = data;        
      },
      error: (error) => {
        console.error('Error al obtener usuarios:', error);
      }
    });  

    this.datosUsuario.buscarVariosDatosPorCampo('usuarios', 'rol', 2)
    .then((usuarios: any[]) => {
      this.especialistas = usuarios.map((element) => ({
        ...element,
        fecha_registro: (element.fecha_registro as Timestamp).toDate()
      }));
    })
    .catch((error) => {
      console.error('Error al buscar usuarios:', error);
    });

    this.datosUsuario.buscarVariosDatosPorCampo('usuarios', 'rol', 3)
    .then((usuarios: any[]) => {
      this.pacientes = usuarios.map((element) => ({
        ...element,
        fecha_registro: (element.fecha_registro as Timestamp).toDate()
      }));
    })
    .catch((error) => {
      console.error('Error al buscar usuarios:', error);
    });

    this.cargarFechasDisponibles();
    this.cargarHorasDisponibles();

  }
  cargarHorasDisponibles() {

    this.horasDisponibles = [];
    for (let hora = 9; hora <= 18; hora++) {
      if(hora >= 9 && hora <= 11){
        this.horasDisponibles.push(`${hora}:00 AM`);
        this.horasDisponibles.push(`${hora}:30 AM`);
      }else{
        this.horasDisponibles.push(`${hora}:00 PM`);
        this.horasDisponibles.push(`${hora}:30 PM`);
      }
      
    }

    console.log(this.horasDisponibles);
  }

  cargarFechasDisponibles() {
    this.fechasDisponibles = [];
    const currentDate = new Date();
    let daysToAdd = 0;
    while (this.fechasDisponibles.length < 15) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + daysToAdd);
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        this.fechasDisponibles.push(date);
      }
      daysToAdd++;
    }
  }

}
