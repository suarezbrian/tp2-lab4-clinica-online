import { Especialista } from "./especialista";
import { Paciente } from "./paciente";

export interface Turno {
    especialidad: string;
    especialista: Especialista;
    paciente: Paciente;
    fecha: Date;
    estado: string;
    comentario: string;
}