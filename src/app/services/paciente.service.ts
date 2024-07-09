import { Injectable } from '@angular/core';
import { Paciente } from '../interfaces/paciente';
import { Firestore, addDoc, arrayUnion, collection, collectionData, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { getStorage, ref, uploadBytesResumable } from '@angular/fire/storage';
import { AlertsService } from './alerts.service';
import { HistoriaClinica } from '../interfaces/historia-clinica';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {

  private storage = getStorage();
 
  constructor(
    private firestore: Firestore,
    private alertService: AlertsService
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

  async agregarHistoriaClinica(
    nombreColeccion: string,
    campoBusqueda: string,
    valorBusqueda: any,
    nuevaHistoriaClinica: HistoriaClinica
  ): Promise<void> {
    try {
      const coleccion = collection(this.firestore, nombreColeccion);
      const querySnapshot = await getDocs(query(coleccion, where(campoBusqueda, '==', valorBusqueda)));
  
      if (querySnapshot.empty) {
        console.log(`No se encontró ningún documento con ${campoBusqueda} = ${valorBusqueda}.`);
        return;
      }
  
      querySnapshot.forEach(async (docSnap) => {
        try {
          const docData = docSnap.data();
          const historiaClinicaExistente = docData['historiaClinica'] || [];
  
          const actualizacion = {
            historiaClinica: arrayUnion(nuevaHistoriaClinica)
          };
  
          await updateDoc(docSnap.ref, actualizacion);
          this.alertService.mostrarAlerta(true, 'Documento actualizado correctamente.', 2000);
        } catch (error) {
          console.error('Error al actualizar el documento:', error);
          this.alertService.mostrarAlerta(false, 'No se pudo actualizar el documento.', 2000);
        }
      });
    } catch (error) {
      console.error('Error al buscar el documento:', error);
      this.alertService.mostrarAlerta(false, 'No se pudo buscar el documento.', 2000);
    }
  }
  
}
