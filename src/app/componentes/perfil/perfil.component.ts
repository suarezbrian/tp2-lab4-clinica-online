import { Component } from '@angular/core';
import { SharedServiceService } from '../../services/shared-service.service';
import { CommonModule } from '@angular/common';
import { PerfilPacienteComponent } from './perfil-paciente/perfil-paciente.component';
import { Timestamp } from '@angular/fire/firestore';
import { PerfilEspecialistaComponent } from './perfil-especialista/perfil-especialista.component';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, PerfilPacienteComponent, PerfilEspecialistaComponent],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent {

  estaLogeado: boolean = false;
  usuarioLogeado: any;

  constructor(private sharedService: SharedServiceService){
    
  }

  ngOnInit() {    
    this.sharedService.estadoCompartido$.subscribe(estado => {
      this.estaLogeado = estado.estaLogeado;
      this.usuarioLogeado = estado.usuarioLogeado;
      this.usuarioLogeado.fecha_registro = (estado.usuarioLogeado.fecha_registro as Timestamp).toDate()
    });
  } 
}
