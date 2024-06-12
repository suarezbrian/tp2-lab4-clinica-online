import { Persona } from '../interfaces/persona';


export interface Paciente extends Persona {

    password: string;
    obraSocial: string;
    imagenUno?: File;  
    imagenDos?: File;  
    rutaArchivoUno?: string;
    rutaArchivoDos?: string;

  }