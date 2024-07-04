import { Especialista } from "./especialista";
import { EstadoTurno } from "./estado-turno";
import { Paciente } from "./paciente";


export interface Turno {   

    especialidad: string;
    especialista: Especialista;
    paciente: Paciente;
    fecha: string;
    hora: string;
    estado: EstadoTurno;
    comentario?: string;
    comentarioCancelar?: string;
    comentarioRechazar?: string;
    encuestaSatifaccion: {respueta1:boolean,respueta2:boolean,respuesta3:boolean, encuestaCompletada: boolean};
    calificacion: {estrellas: number, comentario: string, calificacionHecha:boolean};
}