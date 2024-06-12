import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AlertsService } from './alerts.service';
import { Especialista } from '../interfaces/especialista';
import { EspecialidadService } from './especialidad.service';
import { PacienteService } from './paciente.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticatorService {

  msjError: string = "";
  msjSucces: string = "";

  constructor( 
    private auth: Auth,
    private router: Router,
    private alertService: AlertsService,
    private especialidadService: EspecialidadService,
    private pacienteService: PacienteService

  ) { }

  entrar(data: any) {
   
    signInWithEmailAndPassword(this.auth, data.email, data.password).then((respuesta)=>{
      if (respuesta.user.email !== null){ 

        const usuarioLogeado = {
          email: data.email,
          estaLogeado: true,
        };

        this.msjSucces = "Bienvenido, " + data.nombre;
        this.alertService.mostrarAlerta(true, this.msjSucces, 1000); 
        localStorage.setItem('usuarioLogeado', JSON.stringify(usuarioLogeado)); 
        //this.sharedService.estaLogeado = true;
        this.router.navigate(['/bienvenida']);
      }
    }).catch((e) => {        

      switch (e.code) {
        case "auth/invalid-credential":
          this.msjError = "Credenciales invalidas";
          break;
        default:
          this.msjError = "Error, en el login del usuario"
          break;
      } 

      this.alertService.mostrarAlerta(false, this.msjError, 2000);  
    });
  }

  registro(data: any, tipo: string) {
    console.log(data);
    createUserWithEmailAndPassword(this.auth, data.email, data.password).then((respuesta)=>{
      if (respuesta.user.email !== null){ 
          
        this.msjSucces = "Registro Exitoso, " + data.nombre;
        this.garudarTipoUsuario(data, tipo);
         
        this.alertService.mostrarAlerta(true, this.msjSucces, 1500);  
        this.entrar(data);
      }


    }).catch((e) => {
     
      switch (e.code) {
        case "auth/invalid-email":
          this.msjError = "Error, email inválido";
          break;
        case "auth/email-already-in-use":
          this.msjError = "Error, email ya está en uso";
          break;
        case "auth/missing-password":
          this.msjError = "Error, contraseña inválida";
          break;
        case "auth/weak-password":
          this.msjError = "Error, contraseña débil";
          break;
        default:
          this.msjError = "Error en el registro"
          break;
      }
      this.alertService.mostrarAlerta(false, this.msjError, 2000);        
    });
  }

  garudarTipoUsuario(data: any, tipo: string){
    switch(tipo){
      case "pac":
        this.pacienteService.guardarPaciente(data);
        break;
      case "espe":
        this.especialidadService.guardarEspecialista(data);
        break;
    }
  }


}
