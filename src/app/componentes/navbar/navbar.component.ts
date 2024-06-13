import { Component } from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { SharedServiceService } from '../../services/shared-service.service';
import { CommonModule } from '@angular/common';
import { AuthenticatorService } from '../../services/authenticator.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatMenuModule, MatButtonModule, RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  estaLogeado: boolean = false;
  usuarioLogeado: any;

  constructor(private sharedService: SharedServiceService, private auth: AuthenticatorService){
    
  }

  ngOnInit() {
   
    this.sharedService.estadoCompartido$.subscribe(estado => {
      this.estaLogeado = estado.estaLogeado;
      this.usuarioLogeado = estado.usuarioLogeado;
    });

  } 

  cerrarSesion(){    
    this.auth.salir(false);    
  }


}
