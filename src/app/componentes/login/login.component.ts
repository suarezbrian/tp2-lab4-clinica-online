import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import {MatCardModule} from '@angular/material/card';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthenticatorService } from '../../services/authenticator.service';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { SharedServiceService } from '../../services/shared-service.service';
import { UsuarioService } from '../../services/usuario.service';
import { Timestamp } from '@angular/fire/firestore';
import { SpinnerComponent } from '../spinner/spinner.component';
import { MatIcon } from '@angular/material/icon';
import { HoverDirective } from '../../directives/hover.directive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatCheckboxModule, CommonModule, MatInputModule, MatButtonModule,MatCardModule, ReactiveFormsModule, SpinnerComponent, MatIcon, HoverDirective],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  providers:[HoverDirective]
})
export class LoginComponent {

  formLogin: FormGroup;
  especialistas: any;
  pacientes: any;
  administrador: any;
  imagenes: any;
  imagenesPaciente: string[] = [];
  imagenesEspecialista: string[] = [];
  imagenesAdministrador: string[] = [];
  isLoading = true;

  constructor(private login: FormBuilder,  private auth: AuthenticatorService, private sharedService: SharedServiceService, private usuarioService: UsuarioService){
    this.formLogin = this.login.group({
      email: new FormControl("", [Validators.required, Validators.email]),
      password: new FormControl("", [Validators.required, Validators.minLength(5)])
    });
  }

  ngOnInit() {
    Promise.all([
      this.usuarioService.buscarVariosDatosPorCampo('usuarios', 'rol', 2),
      this.usuarioService.buscarVariosDatosPorCampo('usuarios', 'rol', 3),
      this.usuarioService.buscarVariosDatosPorCampo('usuarios', 'rol', 1)
    ])
    .then(([especialistas, pacientes, administrador]) => {
      this.especialistas = this.obtenerUltimosElementos(especialistas, 2);      
      this.pacientes = this.obtenerUltimosElementos(pacientes, 3);     
      this.administrador = this.obtenerUltimosElementos(administrador, 1);  

      this.guardarImagenes(this.pacientes, this.imagenesPaciente);
      this.guardarImagenes(this.especialistas, this.imagenesEspecialista);
      this.guardarImagenes(this.administrador, this.imagenesAdministrador);

     
    })
    .catch((error) => {
      console.error('Error al buscar usuarios:', error);
    }).finally(() => {
      this.isLoading = false; 
    });;

    
  }

  async guardarImagenes(usuarios: any[], arregloImagenes: string[]) {
    for (let usuario of usuarios) {
      let ruta = await this.cargarImagenes(usuario.rutaArchivoUno);
      arregloImagenes.push(ruta);
    }
  }

  private obtenerUltimosElementos(usuarios: any[], cantidad: number): any[] {
    return usuarios
      .sort((a, b) => (b.fecha_registro as Timestamp).toDate().getTime() - (a.fecha_registro as Timestamp).toDate().getTime())
      .slice(0, cantidad)
      .map((element) => ({
        ...element,
        fecha_registro: (element.fecha_registro as Timestamp).toDate()        
      }));
  }

  async cargarImagenes(rutaCarpeta: string): Promise<string> {    
    try {
      const imagenes = await this.usuarioService.obtenerImagen(rutaCarpeta);      
      return imagenes;
    } catch (error) {
      console.error('Error al cargar las imágenes:', error);
      throw error;
    }
  }

  entrar() {
    if (this.formLogin.valid) {
      this.auth.entrar(this.formLogin.get('email')?.value, this.formLogin.get('password')?.value);
     } else {
       this.marcarCamposFaltantes();
     }
  }

  private marcarCamposFaltantes() {
    Object.values(this.formLogin.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  autoComplete(tipo: string, index: number) {
    this.formLogin.reset();
    switch (tipo) {   
      case 'espe':
        this.formLogin.patchValue({
          email: this.especialistas[index].email,
          password: this.especialistas[index].password
        });
        break;
      case 'pac':
        this.formLogin.patchValue({
          email: this.pacientes[index].email,
          password: this.pacientes[index].password
        });
        break;
      case 'adm':      
        this.formLogin.patchValue({
          email: this.administrador[index].email,
          password: this.administrador[index].password
        });
        break;
    }
  }

}
