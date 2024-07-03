import { Component, Input } from '@angular/core';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-perfil-paciente',
  standalone: true,
  imports: [],
  templateUrl: './perfil-paciente.component.html',
  styleUrl: './perfil-paciente.component.css'
})
export class PerfilPacienteComponent {
  @Input() datosPaciente: any;
  primeraImagen: any;
  segundaImagen: any;

  constructor(private usuarioServices:UsuarioService){  
  }

  async ngOnInit(){
    await this.guardarImagenes(this.datosPaciente);

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
  
}
