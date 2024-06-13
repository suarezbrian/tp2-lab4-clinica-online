import { Injectable } from '@angular/core';
import { Paciente } from '../interfaces/paciente';
import { Firestore, addDoc, collection, collectionData, getDocs, query, where } from '@angular/fire/firestore';
import { getStorage, ref, uploadBytesResumable } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {

  private storage = getStorage();
 
  constructor(
    private firestore: Firestore
  ) { 
     
  }

  async guardarPaciente(pacienteData: Paciente) {
    try {
      let filePathUno = '';
      let filePathDos = '';
      
      if (pacienteData.imagenUno) {
        filePathUno = `pacientes/${pacienteData.imagenUno.name}`;
        const fileRefUno = ref(this.storage, filePathUno);
        await uploadBytesResumable(fileRefUno, pacienteData.imagenUno);
      }

      if (pacienteData.imagenDos) {
        filePathDos = `pacientes/${pacienteData.imagenDos.name}`;
        const fileRefDos = ref(this.storage, filePathDos);
        await uploadBytesResumable(fileRefDos, pacienteData.imagenDos);
      }

      const dataPaciente: Partial<Paciente> = {
        nombre: pacienteData.nombre,
        apellido: pacienteData.apellido,
        edad: pacienteData.edad,
        dni: pacienteData.dni,
        email: pacienteData.email,
        fecha_registro: pacienteData.fecha_registro,
        rol: pacienteData.rol,
        password: pacienteData.password,
        obraSocial: pacienteData.obraSocial,
        rutaArchivoUno: filePathUno, 
        rutaArchivoDos: filePathDos  
      };

      const pacienteCollection = collection(this.firestore, 'usuarios');
      await addDoc(pacienteCollection, dataPaciente);
      
    } catch (error) {
      console.error('Error al guardar los datos del paciente:', error);
      throw error;
    }
  }
  
}
