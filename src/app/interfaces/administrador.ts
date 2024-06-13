import { Persona } from "./persona";

export interface Administrador extends Persona {
    
    password: string;
    imagenUno?: File; 
    rutaArchivoUno?: string;

}
