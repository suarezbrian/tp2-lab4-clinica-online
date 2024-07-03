import { Component } from '@angular/core';
import { SharedServiceService } from '../../services/shared-service.service';
import { MisTurnosComponent } from './mis-turnos/mis-turnos.component';
import { CommonModule } from '@angular/common';
import { MisTurnosEspecialistaComponent } from './mis-turnos-especialista/mis-turnos-especialista.component';
import { TurnosAdminComponent } from './turnos-admin/turnos-admin.component';

@Component({
  selector: 'app-turno',
  standalone: true,
  imports: [MisTurnosComponent, CommonModule, MisTurnosEspecialistaComponent, TurnosAdminComponent],
  templateUrl: './turno.component.html',
  styleUrl: './turno.component.css'
})
export class TurnoComponent {

  estaLogeado: boolean = false;
  usuarioLogeado: any;

  constructor(private sharedService: SharedServiceService){
    
  }

  ngOnInit() {    
    this.sharedService.estadoCompartido$.subscribe(estado => {
      this.estaLogeado = estado.estaLogeado;
      this.usuarioLogeado = estado.usuarioLogeado;
    });
  } 

}
