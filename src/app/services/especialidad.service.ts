import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, collectionData } from '@angular/fire/firestore';
import { Especialista } from '../interfaces/especialista';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { getStorage, ref, uploadBytesResumable } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class EspecialidadService {

  especialistaCollection: Especialista[] = []; 
  respCollection: any;
  subscription!: Subscription;

  private storage = getStorage();

  private _especialistaCollection: BehaviorSubject<Especialista[] | null> = new BehaviorSubject<Especialista[] | null>(null);
  especialistaCollection$ = this._especialistaCollection.asObservable();

  constructor(
    private firestore: Firestore
  ) { 
    this.obtenerEspecialistaCollection();   
  }

  obtenerEspecialistaCollection(): Observable<Especialista[]> {
    let especialistaCollection = collection(this.firestore, 'especialistas');

    const observable = collectionData(especialistaCollection);

    const especialistaSubject = new Subject<Especialista[]>();

    this.subscription = observable.subscribe((respuesta: any) => {
        this.respCollection = respuesta;
       
        for (let i = 0; i < respuesta.length; i++) {
          
          let especialista: Especialista = {
            nombre: this.respCollection[i].nombre,
            apellido: this.respCollection[i].apellido,
            edad: this.respCollection[i].edad,
            dni: this.respCollection[i].dni,
            email: this.respCollection[i].email,
            fecha_registro: new Date(this.respCollection[i].fecha_registro.seconds * 1000),
            rol: this.respCollection[i].rol,
            password: this.respCollection[i].password,
            especialidad: this.respCollection[i].especialidad,
            imagenUno: this.respCollection[i].imagenUno
          };

          this.especialistaCollection.push(especialista);
        } 

        this._especialistaCollection.next(this.especialistaCollection);        
        especialistaSubject.next(this.especialistaCollection);
        especialistaSubject.complete(); 
    });   

    return especialistaSubject.asObservable(); 
  }

  async guardarEspecialista(especialistaData: Especialista) {
    try {
      let filePath = '';
      if (especialistaData.imagenUno) {
        filePath = `especialista/${especialistaData.imagenUno.name}`;
        const fileRef = ref(this.storage, filePath);
        const subirArchivo = await uploadBytesResumable(fileRef, especialistaData.imagenUno);
      }

      const dataEspecialista: Partial<Especialista> = {
        nombre: especialistaData.nombre,
        apellido: especialistaData.apellido,
        edad: especialistaData.edad,
        dni: especialistaData.dni,
        email: especialistaData.email,
        fecha_registro: especialistaData.fecha_registro,
        rol: especialistaData.rol,
        password: especialistaData.password,
        especialidad: especialistaData.especialidad,
        rutaArchivoUno: filePath 
      };

      const especialistaCollection = collection(this.firestore, 'especialistas');
      await addDoc(especialistaCollection, dataEspecialista);

    } catch (error) {
      console.error('Error al guardar los datos del especialista:', error);
      throw error;
    }
  }

  get getEspecialistaCollection(): Especialista[] | null  {
    return this._especialistaCollection.getValue();
  }

  set setEspecialistaCollection(valor: Especialista[] | null) {
    this._especialistaCollection.next(valor);
  }
}
