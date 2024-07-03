import { Component, Input, inject } from '@angular/core';
import { UsuarioService } from '../../../services/usuario.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedServiceService } from '../../../services/shared-service.service';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-perfil-especialista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil-especialista.component.html',
  styleUrl: './perfil-especialista.component.css'
})
export class PerfilEspecialistaComponent {
  @Input() datosEspecialista: any;
  primeraImagen: any;
  estaLogeado: boolean = false;
  datosCargados: any;
  mostrarDisponibilidad: boolean = false;

  disponibilidad: any = {
    diaInicio: 'Lunes',
    diaFin: 'Viernes',
    horaInicio: '08:00',
    horaFin: '22:00'
  };

  constructor(private usuarioServices:UsuarioService, private sharedServices:SharedServiceService){  
  }

  async ngOnInit(){
    await this.guardarImagenes(this.datosEspecialista);
    this.mostrarHorarios(this.datosEspecialista);
  }

  mostrarHorarios(especialista: any){
    console.log(especialista);
    if(especialista.disponibilidadHoraria.diaInicio !== ""){
      this.mostrarDisponibilidad = true;
    }else{
      this.mostrarDisponibilidad = false;
    }
  }


  async guardarImagenes(usuarios: any) {   
    this.primeraImagen = await this.cargarImagenes(usuarios.rutaArchivoUno);
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

  async cargarEspecialista(){
    this.datosCargados = await this.usuarioServices.buscarDatoPorCampo('usuarios', 'email', this.datosEspecialista.email);
    console.log("aqui",this.datosCargados);
  }

 async guardarDisponibilidadHoraria(){    
    await this.usuarioServices.actualizarColeccion("usuarios", "email", this.datosEspecialista.email, { disponibilidadHoraria: this.disponibilidad }); 
    await this.cargarEspecialista(); 
    this.mostrarHorarios(this.datosCargados);
  }
}
