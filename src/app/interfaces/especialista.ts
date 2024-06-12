import { Persona } from "./persona";

export interface Especialista extends Persona {
    
    password: string;
    especialidad: string;
    imagenUno?: File; 
    rutaArchivoUno?: string;

  }