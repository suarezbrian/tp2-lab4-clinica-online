import { Injectable } from '@angular/core';
import { Turno } from '../interfaces/turno';
import { Firestore, addDoc, collection, getDocs, query, where } from '@angular/fire/firestore';
import { AlertsService } from './alerts.service';

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
        calificacion: {
          estrellas: 0,
          comentario: ''
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
          where('estado', '!=', 3), 
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
}
