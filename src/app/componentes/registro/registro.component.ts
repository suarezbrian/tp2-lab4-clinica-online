import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { RegistroEspecialistaComponent } from './registro-especialista/registro-especialista.component';
import { RegistroPacienteComponent } from './registro-paciente/registro-paciente.component';


@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [RegistroEspecialistaComponent, RegistroPacienteComponent, MatTabsModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {

  constructor() {
 
  }  
}
