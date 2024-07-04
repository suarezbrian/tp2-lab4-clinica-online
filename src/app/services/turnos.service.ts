import { Injectable } from '@angular/core';
import { Turno } from '../interfaces/turno';
import { Firestore, addDoc, collection, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { AlertsService } from './alerts.service';
import { EstadoTurno } from "../interfaces/estado-turno";

@Injectable({
  providedIn: 'root'
})
export class TurnosService {

  constructor(private firestore: Firestore, private alertService: AlertsService) { }

  async guardarTurno(turnoData: Turno) {
    try {
      const dataTurno: Partial<Turno> = {
        especialidad: turnoData.especialidad,
        especialista: turnoData.especialista,
        paciente: turnoData.paciente,
        fecha: turnoData.fecha,
        hora: turnoData.hora,
        estado: turnoData.estado, 
        comentario: turnoData.comentario,
        encuestaSatifaccion: {respueta1: false, respueta2: false, respuesta3:false, encuestaCompletada:false},
        calificacion: {
          estrellas: 0,
          comentario: '',
          calificacionHecha: false
        }
      };
  
      const turnosCollection = collection(this.firestore, 'turnos');
      await addDoc(turnosCollection, dataTurno);
      this.alertService.mostrarAlerta(true, 'Turno guardado exitosamente', 2000);
      console.log();
    } catch (error) {
      console.error('Error al guardar los datos del turno:', error);
      throw error;
    }
  }

  async buscarTurnos(especialistaEmail: string): Promise<Turno[]> {
    const collectionRef = collection(this.firestore, 'turnos');
    
    try {
      const querySnapshot = await getDocs(
        query(
          collectionRef, 
          where('especialista.email', '==', especialistaEmail)
        )
      );
  
      if (!querySnapshot.empty) {
        const turnos: Turno[] = [];
  
        querySnapshot.forEach((doc) => {
          const turno = doc.data() as Turno;
          console.log(turno.estado);
          if (turno.estado === EstadoTurno.Pendiente || turno.estado === EstadoTurno.Confirmado) {
            turnos.push(turno);
          }
        });
  
        return turnos;
      } else {
        console.log(`No se encontraron turnos para el especialista con email = ${especialistaEmail}.`);
        return [];
      }
    } catch (error) {
      console.error(`Error al buscar turnos para el especialista con email ${especialistaEmail}:`, error);
      throw new Error(`No se pudo buscar turnos para el especialista con email ${especialistaEmail}.`);
    }
  }

  async obtenerTurnos(especialistaEmail: string): Promise<Turno[]> {
    const collectionRef = collection(this.firestore, 'turnos');
    
    try {
      const querySnapshot = await getDocs(
        query(
          collectionRef, 
          where('especialista.email', '==', especialistaEmail) 
        )
      );
  
      if (!querySnapshot.empty) {
        const turnos: Turno[] = [];
  
        querySnapshot.forEach((doc) => {
          turnos.push(doc.data() as Turno);
        });
  
        return turnos; 
      } else {
        console.log(`No se encontraron turnos para el especialista con email = ${especialistaEmail}.`);
        return []; 
      }
    } catch (error) {
      console.error(`Error al buscar turnos para el especialista con email ${especialistaEmail}:`, error);
      throw new Error(`No se pudo buscar turnos para el especialista con email ${especialistaEmail}.`);
    }
  }

  async obtenerTurnosPaciente(pacienteEmail: string): Promise<Turno[]> {
    const collectionRef = collection(this.firestore, 'turnos');
    
    try {
      const querySnapshot = await getDocs(
        query(
          collectionRef, 
          where('paciente.email', '==', pacienteEmail) 
        )
      );

      if (!querySnapshot.empty) {
        const turnos: Turno[] = [];
  
        querySnapshot.forEach((doc) => {
          turnos.push(doc.data() as Turno);
        });
  
        return turnos; 
      } else {
        console.log(`No se encontraron turnos para el paciente con email = ${pacienteEmail}.`);
        return []; 
      }
    } catch (error) {
      console.error(`Error al buscar turnos para el paciente con email ${pacienteEmail}:`, error);
      throw new Error(`No se pudo buscar turnos para el paciente con email ${pacienteEmail}.`);
    }
  }

  async actualizarTurno(
    especialistaEmail: string, 
    fecha: string, 
    hora: string, 
    estado: number, 
    camposActualizar: { [key: string]: any }
  ): Promise<void> {
  
    try {
      const coleccion = collection(this.firestore, 'turnos');
      const querySnapshot = await getDocs(
        query(
          coleccion, 
          where('especialista.email', '==', especialistaEmail),
          where('fecha', '==', fecha),
          where('hora', '==', hora),
          where('estado', '==', estado)
        )
      );
  
      if (querySnapshot.empty) {
        console.log(`No se encontró ningún turno con los criterios especificados.`);
        return;
      }
  
      querySnapshot.forEach(async (doc) => {
        try {
          await updateDoc(doc.ref, camposActualizar);
          this.alertService.mostrarAlerta(true, 'Turno actualizado correctamente.', 2000);
        } catch (error) {
          this.alertService.mostrarAlerta(false, 'No se pudo actualizar el turno.', 2000);
        }
      });
    } catch (error) {
      this.alertService.mostrarAlerta(false, 'No se pudo buscar el turno.', 2000);
    }
  }
}
