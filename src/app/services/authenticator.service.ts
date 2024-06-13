import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AlertsService } from './alerts.service';
import { Especialista } from '../interfaces/especialista';
import { EspecialidadService } from './especialidad.service';
import { PacienteService } from './paciente.service';
import { SharedServiceService } from './shared-service.service';
import { UsuarioService } from './usuario.service';
import { AdministradorService } from './administrador.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticatorService {

  msjError: string = "";
  msjSucces: string = "";
  datos: any;
  esRegistro: boolean = false;
  esLogin: boolean = false;

  constructor( 
    private auth: Auth,
    private router: Router,
    private alertService: AlertsService,
    private especialidadService: EspecialidadService,
    private pacienteService: PacienteService,
    private sharedService: SharedServiceService,
    private usuarioService:UsuarioService,
    private administradorService: AdministradorService

  ) { }

  async entrar(email: string, password: string) {

    this.esLogin = true;
    this.datos = await this.usuarioService.buscarDatoPorCampo('usuarios', 'email', email);
    
    signInWithEmailAndPassword(this.auth, email, password).then((respuesta)=>{
      if (respuesta.user.email !== null){ 


        if (respuesta.user.emailVerified){ 
          if(this.datos.validarEstado === false){
            this.alertService.mostrarAlerta(false, 'Especialista no habilitado.', 2000); 
            return;
          }
          this.msjSucces = "Bienvenido, " + this.datos?.nombre;
          this.alertService.mostrarAlerta(true, this.msjSucces, 1000); 
          this.sharedService.estaLogeado = true;
          this.sharedService.usuarioLogeado = this.datos;
          this.router.navigate(['/bienvenida']);
        }else{      
          this.alertService.mostrarAlerta(false, 'Correo no verificado.', 2000); 
        }
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
    this.esRegistro = true;
    createUserWithEmailAndPassword(this.auth, data.email, data.password).then((respuesta) => {
      if (respuesta.user.email !== null) {
        sendEmailVerification(respuesta.user).then(() => {

          this.garudarTipoUsuario(data, tipo);
          this.alertService.mostrarAlerta(true, this.msjSucces, 1500);
          this.alertService.mostrarAlertaModal('Registro Exitoso.','Se ha enviado un correo de verificación a tu dirección de correo electrónico. Por favor revisa tu bandeja de entrada y haz clic en el enlace de verificación para completar tu registro.',          'https://img.freepik.com/vector-premium/sobre-abierto-documento-icono-linea-marca-verificacion-verde-correo-mensaje-confirmacion-oficial-enviado-exito-correo-electronico-verificacion-entrega-correo-electronico-diseno-plano-vector_662353-720.jpg',200, 200, 'Verificación de mail');     
          this.salir(this.esRegistro);
        }).catch((e) => {
          this.msjError = "Error al enviar el correo de verificación.";
          this.alertService.mostrarAlerta(false, this.msjError, 2000);
        });
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
          this.msjError = "Error en el registro";
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
      case "adm":
        this.administradorService.guardarAdministrador(data);
        break;
    }
  }

  salir(esRegistro: boolean) {
    this.sharedService.estaLogeado = false;
    this.auth.signOut().then(() => {
      if(!esRegistro){
      this.msjSucces = "Sesión cerrada exitosamente."
      this.alertService.mostrarAlerta(true,this.msjSucces, 1500);
      }
      this.router.navigate(['/bienvenida']);  
    }).catch((error) => {
      this.msjError = "Error al cerrar sesión:" + error
      this.alertService.mostrarAlerta(false,this.msjError, 2000);
    });
  }

  async verificarEstadoAuth(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      onAuthStateChanged(this.auth, async (user: any | null) => {        
        if (user) {         
          try {
            const email = user.email;

            this.datos = await this.usuarioService.buscarDatoPorCampo('usuarios', 'email', email);  
            
            if (!this.esRegistro && !this.esLogin) {
              this.sharedService.estadoCompartido = {
                estaLogeado: true,
                usuarioLogeado: this.datos
              };
            } else {
              this.esRegistro = false;
              this.esLogin = false;
            }
          } catch (error) {
            this.msjError = 'Error, al buscar al usuario logeado: ' + error;
            this.alertService.mostrarAlerta(false, this.msjError, 2000);
          }
        } else {        
          this.sharedService.estadoCompartido = {
            estaLogeado: false,
            usuarioLogeado: null
          };
        }
        resolve();
      });
    });
  }


}
