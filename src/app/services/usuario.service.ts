import { Injectable, Injector } from '@angular/core';
import { Firestore, collection, collectionData, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { AlertsService } from './alerts.service';
import { getDownloadURL, listAll, ref, Storage } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private subscription!: Subscription;
  private _dataCollection: BehaviorSubject<any[] | null> = new BehaviorSubject<any[] | null>(null);
  dataCollection$ = this._dataCollection.asObservable();

  constructor(private firestore: Firestore, private alertService:AlertsService, private storage: Storage) { }

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

  async buscarVariosDatosPorCampoArray(collectionName: string, campo: string, valor: any): Promise<any[]> {
    const collectionRef = collection(this.firestore, collectionName);
  
    try {
      const querySnapshot = await getDocs(query(collectionRef, where(campo, 'array-contains', valor)));
      if (!querySnapshot.empty) {
        const datos: any[] = [];
  
        querySnapshot.forEach((doc) => {
          datos.push(doc.data());
        });
  
        return datos;
      } else {
        console.log(`No se encontraron documentos con ${campo} que contengan ${valor}.`);
        return [];
      }
    } catch (error) {
      console.error(`Error al buscar documentos por ${campo}:`, error);
      throw new Error(`No se pudo buscar documentos por ${campo}.`);
    }
  }

  async actualizarColeccion(nombreColeccion: string, campoBusqueda: string, valorBusqueda: any, camposActualizar: { [key: string]: any }): Promise<void> {

    try {
      const coleccion = collection(this.firestore, nombreColeccion);
      const querySnapshot = await getDocs(query(coleccion, where(campoBusqueda, '==', valorBusqueda)));
  
      if (querySnapshot.empty) {
        console.log(`No se encontró ningún documento con ${campoBusqueda} = ${valorBusqueda}.`);
        return;
      }
  
      querySnapshot.forEach(async (doc) => {
        try {
          await updateDoc(doc.ref, camposActualizar);
          this.alertService.mostrarAlerta(true, 'Documento actualizado correctamente.', 2000);
        } catch (error) {
          this.alertService.mostrarAlerta(false, 'No se pudo actualizar el documento.', 2000);
        }
      });
    } catch (error) {
      this.alertService.mostrarAlerta(false, 'No se pudo buscar el documento.', 2000);
    }
  }

  async obtenerImagen(rutaImagen: string): Promise<string> {
    const storageRef = ref(this.storage, rutaImagen);
  
    try {
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error('Error al obtener la imagen:', error);
      throw new Error('No se pudo obtener la imagen.');
    }
  }

}
