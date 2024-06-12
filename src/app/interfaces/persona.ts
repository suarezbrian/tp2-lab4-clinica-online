export enum Rol {
    Administrador = 1,
    Especialista = 2,
    Paciente = 3
}
  
export interface Persona {    
    nombre: string;
    apellido: string;
    edad: number;
    dni: string;
    email: string;
    fecha_registro: Date;
    rol: Rol; 
}
