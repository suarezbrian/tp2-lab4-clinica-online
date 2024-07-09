import { Persona } from '../interfaces/persona';
import { HistoriaClinica } from './historia-clinica';


export interface Paciente extends Persona {

    password: string;
    obraSocial: string;
    imagenUno?: File;  
    imagenDos?: File;  
    rutaArchivoUno?: string;
    rutaArchivoDos?: string;
    historiaClinica?: HistoriaClinica[];   

  }