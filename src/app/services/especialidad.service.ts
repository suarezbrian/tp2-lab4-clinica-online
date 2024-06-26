import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, getDocs, query, where } from '@angular/fire/firestore';
import { Especialista } from '../interfaces/especialista';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { getStorage, ref, uploadBytesResumable } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class EspecialidadService {

  private storage = getStorage();
  private subscription!: Subscription;
  private _dataCollection: BehaviorSubject<any[] | null> = new BehaviorSubject<any[] | null>(null);

  constructor(
    private firestore: Firestore
  ) { 
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
        rutaArchivoUno: filePath,
        validarEstado: false
      };

      const especialistaCollection = collection(this.firestore, 'usuarios');
      await addDoc(especialistaCollection, dataEspecialista);

    } catch (error) {
      console.error('Error al guardar los datos del especialista:', error);
      throw error;
    }
  }

  async guardarEspecialidad(nombre: string) {
    try {

      const especialidad: any = {
        nombre: nombre
      };

      const especialistaCollection = collection(this.firestore, 'especialidad');
      await addDoc(especialistaCollection, especialidad);

    } catch (error) {
      console.error('Error al guardar los datos del especialista:', error);
      throw error;
    }
  }

}
