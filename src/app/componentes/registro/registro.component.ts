import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { RegistroEspecialistaComponent } from './registro-especialista/registro-especialista.component';
import { RegistroPacienteComponent } from './registro-paciente/registro-paciente.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { UsuarioService } from '../../services/usuario.service';
import { SpinnerComponent } from '../spinner/spinner.component';


@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [RegistroEspecialistaComponent, RegistroPacienteComponent, MatTabsModule, CommonModule, MatIconModule, SpinnerComponent],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {

  esRegistroPaciente = false;
  esRegistroEspecialista = false;
  isLoading = true;
  imagenPaciente: any;
  imagenEspecialista: any;
  
  constructor( private usuarioServices: UsuarioService) {
 
  } 

  async ngOnInit() {
    this.imagenPaciente = await this.cargarUnaVezImagen("iconos/registro/r-paciente.png");
    this.imagenEspecialista = await this.cargarUnaVezImagen("iconos/registro/r-especialista.png");
    this.isLoading = false;
  }
  
  private async cargarUnaVezImagen(imageUrl: string) {
    let storedImage = localStorage.getItem(imageUrl);
  
    if (!storedImage) {
      storedImage = await this.usuarioServices.obtenerImagen(imageUrl);
      localStorage.setItem(imageUrl, storedImage);
    }
  
    return storedImage;
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
