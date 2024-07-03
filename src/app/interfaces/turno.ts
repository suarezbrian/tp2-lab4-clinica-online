import { Especialista } from "./especialista";
import { Paciente } from "./paciente";

enum EstadoTurno {
    Pendiente = 1,
    Confirmado = 2,
    Cancelado = 3
 }

export interface Turno {
    especialidad: string;
    especialista: Especialista;
    paciente: Paciente;
    fecha: string;
    hora: string;
    estado: EstadoTurno;
    comentario: string;
    calificacion: {estrellas: number, comentario: string};
}