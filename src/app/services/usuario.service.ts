import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, getDocs, query, where } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private subscription!: Subscription;
  private _dataCollection: BehaviorSubject<any[] | null> = new BehaviorSubject<any[] | null>(null);
  dataCollection$ = this._dataCollection.asObservable();

  constructor(private firestore: Firestore) { }

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

  async buscarDatoPorCampo(collectionName: string, campo: string, valor: any): Promise<any | undefined> {
    const collectionRef = collection(this.firestore, collectionName);

    try {
      const querySnapshot = await getDocs(query(collectionRef, where(campo, '==', valor)));
      if (querySnapshot.size > 0) {
        const doc = querySnapshot.docs[0];
        return doc.data();
      } else {
        console.log(`No se encontró ningún documento con ${campo} = ${valor}.`);
        return undefined;
      }
    } catch (error) {
      console.error(`Error al buscar el documento por ${campo}:`, error);
      throw new Error(`No se pudo buscar el documento por ${campo}.`);
    }
  }

  async buscarVariosDatosPorCampo(collectionName: string, campo: string, valor: any): Promise<any[]> {
    const collectionRef = collection(this.firestore, collectionName);
  
    try {
      const querySnapshot = await getDocs(query(collectionRef, where(campo, '==', valor)));
      if (!querySnapshot.empty) {
        const datos: any[] = [];
  
        querySnapshot.forEach((doc) => {
          datos.push(doc.data());
        });
  
        return datos; 
      } else {
        console.log(`No se encontraron documentos con ${campo} = ${valor}.`);
        return []; 
      }
    } catch (error) {
      console.error(`Error al buscar documentos por ${campo}:`, error);
      throw new Error(`No se pudo buscar documentos por ${campo}.`);
    }
  }
}
