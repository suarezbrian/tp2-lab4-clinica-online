import { Injectable } from '@angular/core';
import { Administrador } from '../interfaces/administrador';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
import { getStorage, ref, uploadBytesResumable } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class AdministradorService {
  
  private storage = getStorage();

  constructor(private firestore: Firestore) { }

  async guardarAdministrador(administradorData: Administrador) {
    try {
      let filePath = '';
      if (administradorData.imagenUno) {
        filePath = `administrador/${administradorData.imagenUno.name}`;
        const fileRef = ref(this.storage, filePath);
        const subirArchivo = await uploadBytesResumable(fileRef, administradorData.imagenUno);
      }

      const dataAdministrador: Partial<Administrador> = {
        nombre: administradorData.nombre,
        apellido: administradorData.apellido,
        edad: administradorData.edad,
        dni: administradorData.dni,
        email: administradorData.email,
        password: administradorData.password,
        fecha_registro: administradorData.fecha_registro,
        rol: administradorData.rol,
        rutaArchivoUno: filePath,
      };

      const administradorCollection = collection(this.firestore, 'usuarios');
      await addDoc(administradorCollection, dataAdministrador);

    } catch (error) {
      console.error('Error al guardar los datos del administrador:', error);
      throw error;
    }
  }
  
}
