import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { RegistroEspecialistaComponent } from './registro-especialista/registro-especialista.component';
import { RegistroPacienteComponent } from './registro-paciente/registro-paciente.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [RegistroEspecialistaComponent, RegistroPacienteComponent, MatTabsModule, CommonModule, MatIconModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {

  esRegistroPaciente = false;
  esRegistroEspecialista = false;

  constructor() {
 
  }  

  registrarPaciente(){
    this.esRegistroEspecialista = false;
    this.esRegistroPaciente = true;
  }

  registrarEspecialista(){
    this.esRegistroEspecialista = true;
    this.esRegistroPaciente = false;
  }

  volver() {
    this.esRegistroEspecialista = false;
    this.esRegistroPaciente = false;
  }
}
