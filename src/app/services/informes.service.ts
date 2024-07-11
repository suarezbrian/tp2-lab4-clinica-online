import { Injectable } from '@angular/core';
import { Logs } from '../interfaces/logs';
import { addDoc, collection, collectionData, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { Turno } from '../interfaces/turno';

@Injectable({
  providedIn: 'root'
})
export class InformesService {

  constructor(private firestore:Firestore) { }
  private subscription!: Subscription;
  private _dataCollection: BehaviorSubject<any[] | null> = new BehaviorSubject<any[] | null>(null);

  async guardarLogs(logsData: Logs) {
    try {
  
      const dataLogs: Partial<Logs> = {
        usuario: logsData.usuario,
        dia: logsData.dia,
        horario: logsData.horario,
      };
  
      const informeCollection = collection(this.firestore, 'logs');
      await addDoc(informeCollection, dataLogs);
      
    } catch (error) {
      console.error('Error al guardar los datos del informe:', error);
      throw error;
    }
  }

  obtenerCollection(collectionName: string): Observable<any[]> {
    const collectionRef = collection(this.firestore, collectionName);
    const observable = collectionData(collectionRef);
    const dataSubject = new Subject<any[]>();

    this.subscription = observable.subscribe((data: any[]) => {
      this._dataCollection.next(data);
      dataSubject.next(data);
      dataSubject.complete();
    });

    return dataSubject.asObservable();
  }

async obtenerTurnosFinalizadosPorEspecialista(fechaInicio: string, fechaFin: string, emailEspecialista: string): Promise<Turno[]> {
      const collectionRef = collection(this.firestore, 'turnos');

      try {
          const allDocsSnapshot = await getDocs(collectionRef);
          const turnos: Turno[] = [];
          
          const fechaInicioDate = this.convertirCadenaAFecha(fechaInicio);
          const fechaFinDate = this.convertirCadenaAFecha(fechaFin);

          allDocsSnapshot.forEach((doc) => {
              const data = doc.data();
              const fechaTurno = this.convertirCadenaAFecha(data["fecha"]);

              if (
                  data["estado"] === 4 &&
                  fechaTurno >= fechaInicioDate &&
                  fechaTurno <= fechaFinDate &&
                  data["especialista"].email === emailEspecialista
              ) {
                  turnos.push(data as Turno);
              }
          });

          if (turnos.length > 0) {
              return turnos;
          } else {
              console.log('No se encontraron turnos.');
              return [];
          }
      } catch (error) {
          console.error('Error al obtener los turnos finalizados:', error);
          throw new Error('No se pudo obtener los turnos finalizados para el especialista.');
      }
}   

async obtenerTurnosPorEspecialista(fechaInicio: string, fechaFin: string, emailEspecialista: string): Promise<Turno[]> {
  const collectionRef = collection(this.firestore, 'turnos');

  try {
      const allDocsSnapshot = await getDocs(collectionRef);
      const turnos: Turno[] = [];
      
      const fechaInicioDate = this.convertirCadenaAFecha(fechaInicio);
      const fechaFinDate = this.convertirCadenaAFecha(fechaFin);

      allDocsSnapshot.forEach((doc) => {
          const data = doc.data();
          const fechaTurno = this.convertirCadenaAFecha(data["fecha"]);

          if (
              fechaTurno >= fechaInicioDate &&
              fechaTurno <= fechaFinDate &&
              data["especialista"].email === emailEspecialista
          ) {
              turnos.push(data as Turno);
          }
      });

      if (turnos.length > 0) {
          return turnos;
      } else {
          console.log('No se encontraron turnos.');
          return [];
      }
  } catch (error) {
      console.error('Error al obtener los turnos:', error);
      throw new Error('No se pudo obtener los turnos para el especialista.');
  }
}   

convertirCadenaAFecha(fecha: string): Date {
  const fechaStr = fecha.substring(1, fecha.length - 1);
  const [diaStr, mesStr] = fechaStr.split('/').map(str => parseInt(str, 10));      
  const fechaConvertida = new Date(new Date().getFullYear(), mesStr - 1, diaStr); 
  return fechaConvertida;
}

  
}
