import { Especialista } from "./especialista";

export interface HistoriaClinica {
    altura: number;
    peso: number;
    temperatura: number;
    presion: string;
    datosDinamicos: Array<{ clave: string; valor: string }>;
    fecha: Date;
    Especialista: Especialista;
}
