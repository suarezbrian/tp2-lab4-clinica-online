import { Injectable } from '@angular/core';
import Swal from 'sweetalert2'

@Injectable({
  providedIn: 'root'
})
export class AlertsService {

  private colaDeAlertas: (() => void)[] = [];
  private alertaActiva: boolean = false;

  constructor() { }

  configuracionAlerta(tipo: boolean, mensaje: string, duracion: number) {
    const alertFunction = () => {
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: duracion,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
      });  
      Toast.fire({
        icon: tipo ? "success": "error",
        title: mensaje,
      }).then(() => {
        
        this.alertaActiva = false;
        if (this.colaDeAlertas.length > 0) {
          const nextAlert = this.colaDeAlertas.shift();
          if (nextAlert) {
            nextAlert();
          }
        }
      });
    };

    if (this.alertaActiva) {
      this.colaDeAlertas.push(alertFunction);
    } else {      
      this.alertaActiva = true;
      alertFunction();
    }
  }
  
  mostrarAlertaModal(titulo: string, texto: string, imageUrl: string, imageWidth: number, imageHeight: number, imageAlt: string) {
    Swal.fire({
      title: titulo,
      text: texto,
      imageUrl: imageUrl,
      imageWidth: imageWidth,
      imageHeight: imageHeight,
      imageAlt: imageAlt
    });
  }
  
  mostrarAlerta(tipo: boolean, mensaje: string, duracion:number) {
    this.configuracionAlerta(tipo, mensaje, duracion);
  }


  async mostrarAlertaConInput(titulo: string, placeholder: string, label: string, textofinal: string) {
    const { value: text } = await Swal.fire({
      input: "textarea",
      inputLabel: label,
      inputPlaceholder: placeholder,
      inputAttributes: {
        "aria-label": placeholder
      },
      showCancelButton: true
    });
    
    if (text) {
      Swal.fire(textofinal);
    }

    return text;
  }
   
}
