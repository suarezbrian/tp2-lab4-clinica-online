import { Persona } from "./persona";

interface DisponibilidadHoraria {
  diaInicia: string;
  diaFin: string;
  horaInicio: string;
  horaFin: string;
}

export interface Especialista extends Persona {
    
    password: string;
    especialidad: string;
    imagenUno?: File; 
    rutaArchivoUno?: string;
    validarEstado?: boolean;
    disponibilidadHoraria?: DisponibilidadHoraria;

  }